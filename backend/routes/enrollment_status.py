from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Enrollment, Payment, User

enrollments_bp = Blueprint("enrollment_status", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@enrollments_bp.route("/my-enrollments", methods=["GET"])
@jwt_required()
def my_enrollments():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403

    enrollments = Enrollment.query.filter_by(student_id=user.id, status="enrolled").all()
    result = []
    for enrollment in enrollments:
        total_modules = len(enrollment.course.modules)
        completed_modules = sum(1 for record in enrollment.progress_records if record.is_completed)
        progress_pct = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0
        payload = enrollment.to_dict()
        payload["progress_percentage"] = progress_pct
        payload["completed_modules"] = completed_modules
        payload["total_modules"] = total_modules
        result.append(payload)
    return jsonify(result)


@enrollments_bp.route("/transactions", methods=["GET"])
@jwt_required()
def transactions():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403

    payments = (
        Payment.query.filter_by(user_id=user.id, payment_type="student_reservation")
        .order_by(Payment.created_at.desc())
        .all()
    )
    return jsonify([payment.to_dict() for payment in payments])


@enrollments_bp.route("/check/<int:course_id>", methods=["GET"])
@jwt_required()
def check_enrollment(course_id):
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403

    enrollment = Enrollment.query.filter_by(student_id=user.id, course_id=course_id, status="enrolled").first()
    latest_payment = (
        Payment.query.filter_by(user_id=user.id, course_id=course_id, payment_type="student_reservation")
        .order_by(Payment.created_at.desc())
        .first()
    )
    return jsonify(
        {
            "enrolled": enrollment is not None,
            "enrollment_id": enrollment.id if enrollment else None,
            "payment_status": latest_payment.status if latest_payment else None,
        }
    )
