from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Course, Enrollment, Payment, ProgressTracking
import uuid

enrollments_bp = Blueprint("enrollments", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


# ─── Student: enroll with mock payment ───────────────────────────────────────
@enrollments_bp.route("/enroll", methods=["POST"])
@jwt_required()
def enroll():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Only students can enroll"}), 403

    data = request.get_json()
    course_id = data.get("course_id")
    if not course_id:
        return jsonify({"error": "course_id is required"}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    if not course.is_published:
        return jsonify({"error": "Course is not available"}), 400

    # Check already enrolled
    existing = Enrollment.query.filter_by(
        student_id=user.id,
        course_id=course_id,
        payment_status="paid",
    ).first()
    if existing:
        return jsonify({"error": "Already enrolled in this course"}), 409

    # Check seats
    if len(course.enrollments) >= course.total_seats:
        return jsonify({"error": "No seats available"}), 400

    # Mock payment
    payment_method = data.get("payment_method", "mock_card")
    card_number = data.get("card_number", "")
    # Simulate failure for card ending in 0000
    payment_success = not card_number.endswith("0000")

    failed_attempt = Enrollment.query.filter_by(
        student_id=user.id,
        course_id=course_id,
        payment_status="failed",
    ).first()
    enrollment = failed_attempt or Enrollment(student_id=user.id, course_id=course_id)
    enrollment.payment_status = "paid" if payment_success else "failed"
    db.session.add(enrollment)
    db.session.flush()

    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    payment = enrollment.payment
    if payment is None:
        payment = Payment(
            enrollment_id=enrollment.id,
            student_id=user.id,
            course_id=course_id,
            amount=course.price,
        )
    payment.status = "success" if payment_success else "failed"
    payment.transaction_id = transaction_id
    payment.payment_method = payment_method
    payment.amount = course.price
    db.session.add(payment)

    if payment_success:
        # Initialize progress records for all modules
        for module in course.modules:
            progress = ProgressTracking(enrollment_id=enrollment.id, module_id=module.id)
            db.session.add(progress)

    db.session.commit()

    if not payment_success:
        return jsonify({
            "error": "Payment failed. Please try a different card.",
            "transaction_id": transaction_id,
            "status": "failed"
        }), 402

    return jsonify({
        "message": "Enrollment successful",
        "transaction_id": transaction_id,
        "enrollment": enrollment.to_dict(),
    }), 201


# ─── Student: my enrolled courses ─────────────────────────────────────────────
@enrollments_bp.route("/my-enrollments", methods=["GET"])
@jwt_required()
def my_enrollments():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403

    enrollments = Enrollment.query.filter_by(student_id=user.id, payment_status="paid").all()
    result = []
    for e in enrollments:
        course = e.course
        total_modules = len(course.modules)
        completed = sum(1 for p in e.progress_records if p.is_completed)
        progress_pct = int((completed / total_modules * 100)) if total_modules > 0 else 0
        d = e.to_dict()
        d["progress_percentage"] = progress_pct
        d["completed_modules"] = completed
        d["total_modules"] = total_modules
        result.append(d)
    return jsonify(result)


# ─── Student: transaction history ─────────────────────────────────────────────
@enrollments_bp.route("/transactions", methods=["GET"])
@jwt_required()
def transactions():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403
    payments = Payment.query.filter_by(student_id=user.id).order_by(Payment.paid_at.desc()).all()
    return jsonify([p.to_dict() for p in payments])


# ─── Student: check enrollment status ─────────────────────────────────────────
@enrollments_bp.route("/check/<int:course_id>", methods=["GET"])
@jwt_required()
def check_enrollment(course_id):
    user = get_current_user()
    enrollment = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if enrollment and enrollment.payment_status == "paid":
        return jsonify({"enrolled": True, "enrollment_id": enrollment.id})
    return jsonify({"enrolled": False})
