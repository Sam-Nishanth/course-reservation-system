from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

from extensions import db
from models import Course, CourseChatMessage, Enrollment, Payment, ProgressTracking, User
from services.course_helpers import (
    apply_course_payload,
    can_teacher_edit,
    can_view_course,
    compact_course_context,
    replace_modules,
)
from services.payment_gateway import create_order, public_key, verify_signature
from services.xai_service import generate_course_tutor_reply

courses_bp = Blueprint("course_workflow", __name__)

CHAT_MESSAGE_LIMIT = 2000


def get_current_user(optional=False):
    if optional:
        try:
            verify_jwt_in_request(optional=True)
        except Exception:
            return None
    user_id = get_jwt_identity()
    if not user_id:
        return None
    return User.query.get(int(user_id))


def latest_student_payment(student_id, course_id):
    return (
        Payment.query.filter_by(
            user_id=student_id,
            course_id=course_id,
            payment_type="student_reservation",
        )
        .order_by(Payment.created_at.desc())
        .first()
    )


def ensure_student_enrolled(student, course):
    enrollment = Enrollment.query.filter_by(
        student_id=student.id,
        course_id=course.id,
        status="enrolled",
    ).first()
    if not enrollment:
        return None, (jsonify({"error": "Only enrolled students can access this course"}), 403)
    return enrollment, None


@courses_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = (
        db.session.query(Course.category)
        .filter(Course.is_published.is_(True))
        .distinct()
        .order_by(Course.category.asc())
        .all()
    )
    return jsonify([category for (category,) in categories if category])


@courses_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def my_courses():
    user = get_current_user()
    if not user or user.role != "teacher":
        return jsonify({"error": "Only teachers can access this"}), 403
    courses = Course.query.filter_by(teacher_id=user.id).order_by(Course.created_at.desc()).all()
    return jsonify([course.to_dict(include_modules=True) for course in courses])


@courses_bp.route("/", methods=["GET"])
def list_published_courses():
    category = request.args.get("category")
    search = request.args.get("search", "").strip()
    sort = request.args.get("sort", "latest")

    query = Course.query.filter_by(is_published=True, approval_status="published")
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    if sort == "price_asc":
        query = query.order_by(Course.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Course.price.desc())
    else:
        query = query.order_by(Course.published_at.desc(), Course.created_at.desc())

    courses = query.all()
    if sort == "popular":
        courses = sorted(
            courses,
            key=lambda course: len([enrollment for enrollment in course.enrollments if enrollment.status == "enrolled"]),
            reverse=True,
        )
    return jsonify([course.to_dict() for course in courses])


@courses_bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    user = get_current_user()
    if not user or user.role != "teacher":
        return jsonify({"error": "Only teachers can create courses"}), 403

    data = request.get_json() or {}
    if not data.get("title", "").strip():
        return jsonify({"error": "Course title is required"}), 400

    course = Course(teacher_id=user.id, title=data["title"].strip(), approval_status="draft")
    apply_course_payload(course, data)
    course.is_published = False
    course.publication_payment_status = "not_required"
    db.session.add(course)
    db.session.flush()
    replace_modules(db, course, data.get("modules", []))
    db.session.commit()
    return jsonify({"message": "Course draft created", "course": course.to_dict(include_modules=True)}), 201


@courses_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    user = get_current_user(optional=True)
    if not can_view_course(user, course):
        return jsonify({"error": "Course not available"}), 404

    payload = course.to_dict(include_modules=True)
    if user and user.role == "student":
        enrollment = Enrollment.query.filter_by(student_id=user.id, course_id=course.id, status="enrolled").first()
        payment = latest_student_payment(user.id, course.id)
        payload["viewer_enrollment"] = enrollment.to_dict() if enrollment else None
        payload["viewer_payment_status"] = payment.status if payment else None
    return jsonify(payload)


@courses_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def update_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)
    if not user or user.role != "teacher" or course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    if not can_teacher_edit(course):
        return jsonify({"error": "This course cannot be edited in its current status"}), 400

    data = request.get_json() or {}
    if "title" in data and not data.get("title", "").strip():
        return jsonify({"error": "Course title is required"}), 400

    apply_course_payload(course, data)
    if "modules" in data:
        replace_modules(db, course, data["modules"])
    db.session.commit()
    return jsonify({"message": "Course updated", "course": course.to_dict(include_modules=True)})


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)
    if user.role == "teacher" and course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    if user.role not in {"teacher", "admin"}:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})


@courses_bp.route("/<int:course_id>/reserve/order", methods=["POST"])
@jwt_required()
def create_reservation_order(course_id):
    user = get_current_user()
    if not user or user.role != "student":
        return jsonify({"error": "Only students can reserve a course"}), 403

    course = Course.query.get_or_404(course_id)
    if not course.is_published or course.approval_status != "published":
        return jsonify({"error": "Course is not available for enrollment"}), 400
    if Enrollment.query.filter_by(student_id=user.id, course_id=course.id, status="enrolled").first():
        return jsonify({"error": "Already enrolled in this course"}), 409
    if Enrollment.query.filter_by(course_id=course.id, status="enrolled").count() >= course.total_seats:
        return jsonify({"error": "No seats available"}), 400

    try:
        order = create_order(
            int(round(course.price * 100)),
            receipt=f"student-{user.id}-course-{course.id}-{int(datetime.utcnow().timestamp())}",
            notes={"payment_type": "student_reservation", "course_id": str(course.id), "user_id": str(user.id)},
        )
    except Exception as error:
        return jsonify({"error": str(error)}), 503

    payment = Payment(
        user_id=user.id,
        course_id=course.id,
        payment_type="student_reservation",
        amount=course.price,
        currency=order.get("currency", "INR"),
        status="created",
        razorpay_order_id=order["id"],
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({"order": order, "payment": payment.to_dict(), "razorpay_key_id": public_key()})


@courses_bp.route("/<int:course_id>/reserve/verify", methods=["POST"])
@jwt_required()
def verify_reservation_payment(course_id):
    user = get_current_user()
    if not user or user.role != "student":
        return jsonify({"error": "Only students can verify course payments"}), 403

    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}
    order_id = data.get("razorpay_order_id", "")
    payment_id = data.get("razorpay_payment_id", "")
    signature = data.get("razorpay_signature", "")
    if not order_id or not payment_id or not signature:
        return jsonify({"error": "Payment verification payload is incomplete"}), 400

    payment = Payment.query.filter_by(
        user_id=user.id,
        course_id=course.id,
        payment_type="student_reservation",
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
        db.session.commit()
        return jsonify({"error": "Payment verification failed"}), 400

    existing_enrollment = Enrollment.query.filter_by(student_id=user.id, course_id=course.id, status="enrolled").first()
    if not existing_enrollment:
        enrollment = Enrollment(
            student_id=user.id,
            course_id=course.id,
            status="enrolled",
            payment_status="paid",
            enrolled_at=datetime.utcnow(),
        )
        db.session.add(enrollment)
        db.session.flush()
        payment.enrollment_id = enrollment.id
        enrollment.payment_id = payment.id
        for module in course.modules:
            db.session.add(ProgressTracking(enrollment_id=enrollment.id, module_id=module.id))
    else:
        enrollment = existing_enrollment
        payment.enrollment_id = existing_enrollment.id

    payment.status = "verified"
    payment.verified_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Enrollment successful", "enrollment": enrollment.to_dict(), "payment": payment.to_dict()})


@courses_bp.route("/<int:course_id>/chat", methods=["GET"])
@jwt_required()
def get_chat(course_id):
    user = get_current_user()
    if not user or user.role != "student":
        return jsonify({"error": "Only students can access course chat"}), 403
    course = Course.query.get_or_404(course_id)
    _, error_response = ensure_student_enrolled(user, course)
    if error_response:
        return error_response

    messages = (
        CourseChatMessage.query.filter_by(student_id=user.id, course_id=course.id)
        .order_by(CourseChatMessage.timestamp.asc())
        .all()
    )
    return jsonify([message.to_dict() for message in messages])


@courses_bp.route("/<int:course_id>/chat", methods=["POST"])
@jwt_required()
def send_chat(course_id):
    user = get_current_user()
    if not user or user.role != "student":
        return jsonify({"error": "Only students can access course chat"}), 403
    course = Course.query.get_or_404(course_id)
    _, error_response = ensure_student_enrolled(user, course)
    if error_response:
        return error_response

    data = request.get_json() or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "Message cannot be empty"}), 400
    if len(content) > CHAT_MESSAGE_LIMIT:
        return jsonify({"error": f"Message must be under {CHAT_MESSAGE_LIMIT} characters"}), 400

    user_message = CourseChatMessage(student_id=user.id, course_id=course.id, role="user", content=content)
    db.session.add(user_message)
    db.session.commit()

    recent_messages = (
        CourseChatMessage.query.filter_by(student_id=user.id, course_id=course.id)
        .order_by(CourseChatMessage.timestamp.desc())
        .limit(10)
        .all()
    )
    prompt = (
        "You are an academic course assistant for this specific course only.\n"
        "Answer clearly, simply, and step by step.\n"
        "Do not invent course details.\n"
        "If information is missing, say so clearly.\n"
        "If the question is outside the current course, say that it is outside the course scope.\n\n"
        f"Course context:\n{compact_course_context(course)}"
    )
    try:
        assistant_reply = generate_course_tutor_reply(
            prompt,
            [{"role": message.role, "content": message.content} for message in reversed(recent_messages)],
        )
    except Exception as error:
        return jsonify({"error": str(error), "message": "Tutor service unavailable"}), 503

    assistant_message = CourseChatMessage(
        student_id=user.id,
        course_id=course.id,
        role="assistant",
        content=assistant_reply,
    )
    db.session.add(assistant_message)
    db.session.commit()
    return jsonify({"message": assistant_message.to_dict()}), 201


@courses_bp.route("/<int:course_id>/chat", methods=["DELETE"])
@jwt_required()
def clear_chat(course_id):
    user = get_current_user()
    if not user or user.role != "student":
        return jsonify({"error": "Only students can clear course chat"}), 403
    course = Course.query.get_or_404(course_id)
    _, error_response = ensure_student_enrolled(user, course)
    if error_response:
        return error_response

    CourseChatMessage.query.filter_by(student_id=user.id, course_id=course.id).delete()
    db.session.commit()
    return jsonify({"message": "Course chat cleared"})
