from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Course, Enrollment, Payment, User
from services.course_helpers import mark_course_published, validate_course_for_review
from services.payment_gateway import create_order, public_key, verify_signature

teacher_bp = Blueprint("teacher_workflow", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@teacher_bp.route("/students", methods=["GET"])
@jwt_required()
def get_enrolled_students():
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    courses = Course.query.filter_by(teacher_id=user.id).all()
    result = []
    for course in courses:
        students = []
        for enrollment in course.enrollments:
            if enrollment.status != "enrolled":
                continue
            total = len(course.modules)
            completed = sum(1 for progress in enrollment.progress_records if progress.is_completed)
            progress_pct = int(completed / total * 100) if total > 0 else 0
            students.append(
                {
                    "enrollment_id": enrollment.id,
                    "student_id": enrollment.student_id,
                    "student_name": enrollment.student.name,
                    "student_email": enrollment.student.email,
                    "enrolled_at": enrollment.enrolled_at.isoformat(),
                    "payment_status": enrollment.payment_status,
                    "progress_percentage": progress_pct,
                    "completed_modules": completed,
                    "total_modules": total,
                    "teacher_remarks": enrollment.teacher_remarks,
                }
            )
        result.append(
            {
                "course_id": course.id,
                "course_title": course.title,
                "approval_status": course.approval_status,
                "enrollment_count": len(students),
                "students": students,
            }
        )
    return jsonify(result)


@teacher_bp.route("/remarks/<int:enrollment_id>", methods=["PUT"])
@jwt_required()
def update_remarks(enrollment_id):
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    enrollment = Enrollment.query.get_or_404(enrollment_id)
    if enrollment.course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    enrollment.teacher_remarks = data.get("remarks", enrollment.teacher_remarks)
    db.session.commit()
    return jsonify({"message": "Remarks updated", "remarks": enrollment.teacher_remarks})


@teacher_bp.route("/stats", methods=["GET"])
@jwt_required()
def teacher_stats():
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    courses = Course.query.filter_by(teacher_id=user.id).all()
    total_students = sum(
        len([enrollment for enrollment in course.enrollments if enrollment.status == "enrolled"])
        for course in courses
    )
    total_revenue = sum(
        payment.amount
        for payment in Payment.query.filter_by(user_id=user.id, payment_type="teacher_publication", status="verified").all()
    )
    return jsonify(
        {
            "total_courses": len(courses),
            "published_courses": len([course for course in courses if course.approval_status == "published"]),
            "pending_review_courses": len([course for course in courses if course.approval_status == "pending_review"]),
            "payment_pending_courses": len([course for course in courses if course.approval_status == "approved_pending_payment"]),
            "total_students": total_students,
            "total_revenue": round(total_revenue, 2),
        }
    )


@teacher_bp.route("/courses/<int:course_id>/submit-review", methods=["POST"])
@jwt_required()
def submit_review(course_id):
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    course = Course.query.get_or_404(course_id)
    if course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    validation_error = validate_course_for_review(course)
    if validation_error:
        return jsonify({"error": validation_error}), 400
    if course.approval_status not in {"draft", "changes_requested", "rejected"}:
        return jsonify({"error": "This course cannot be submitted for review right now"}), 400

    course.approval_status = "pending_review"
    course.is_published = False
    course.submitted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Course submitted for admin review", "course": course.to_dict(include_modules=True)})


@teacher_bp.route("/courses/<int:course_id>/publication/order", methods=["POST"])
@jwt_required()
def create_publication_order(course_id):
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    course = Course.query.get_or_404(course_id)
    if course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    if course.approval_status != "approved_pending_payment":
        return jsonify({"error": "This course is not waiting for publication payment"}), 400
    if course.publication_fee <= 0:
        return jsonify({"error": "No publication fee is configured for this course"}), 400

    try:
        order = create_order(
            int(round(course.publication_fee * 100)),
            receipt=f"teacher-{user.id}-course-{course.id}-{int(datetime.utcnow().timestamp())}",
            notes={"payment_type": "teacher_publication", "course_id": str(course.id), "user_id": str(user.id)},
        )
    except Exception as error:
        return jsonify({"error": str(error)}), 503

    payment = Payment(
        user_id=user.id,
        course_id=course.id,
        payment_type="teacher_publication",
        amount=course.publication_fee,
        currency=order.get("currency", "INR"),
        status="created",
        razorpay_order_id=order["id"],
    )
    db.session.add(payment)
    course.publication_payment_status = "pending"
    db.session.commit()
    return jsonify({"order": order, "payment": payment.to_dict(), "razorpay_key_id": public_key()})


@teacher_bp.route("/courses/<int:course_id>/publication/verify", methods=["POST"])
@jwt_required()
def verify_publication_payment(course_id):
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    course = Course.query.get_or_404(course_id)
    if course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    order_id = data.get("razorpay_order_id", "")
    payment_id = data.get("razorpay_payment_id", "")
    signature = data.get("razorpay_signature", "")
    if not order_id or not payment_id or not signature:
        return jsonify({"error": "Payment verification payload is incomplete"}), 400

    payment = Payment.query.filter_by(
        user_id=user.id,
        course_id=course.id,
        payment_type="teacher_publication",
        razorpay_order_id=order_id,
    ).first()
    if not payment:
        return jsonify({"error": "Payment order not found"}), 404

    try:
        verified = verify_signature(order_id, payment_id, signature)
    except Exception as error:
        return jsonify({"error": str(error)}), 503

    payment.razorpay_payment_id = payment_id
    payment.razorpay_signature = signature
    payment.signature_verified = verified
    if not verified:
        payment.status = "failed"
        course.publication_payment_status = "failed"
        db.session.commit()
        return jsonify({"error": "Payment verification failed"}), 400

    payment.status = "verified"
    payment.verified_at = datetime.utcnow()
    course.publication_payment_status = "paid"
    mark_course_published(course)
    db.session.commit()
    return jsonify({"message": "Course published successfully", "course": course.to_dict(include_modules=True)})
