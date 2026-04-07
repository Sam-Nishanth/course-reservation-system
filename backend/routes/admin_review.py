from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import or_

from extensions import db
from models import Course, Enrollment, Payment, User
from services.course_helpers import mark_course_published

admin_bp = Blueprint("admin_review", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def require_admin(user):
    return bool(user and user.role == "admin")


def _review_payload(course):
    return course.to_dict(include_modules=True)


@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
def analytics():
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    total_users = User.query.count()
    total_teachers = User.query.filter_by(role="teacher").count()
    total_students = User.query.filter_by(role="student").count()
    total_courses = Course.query.count()
    published_courses = Course.query.filter_by(approval_status="published").count()
    total_enrollments = Enrollment.query.filter_by(status="enrolled").count()
    total_revenue = (
        db.session.query(db.func.sum(Payment.amount))
        .filter(Payment.status == "verified", Payment.payment_type == "student_reservation")
        .scalar()
        or 0
    )
    pending_reviews = Course.query.filter_by(approval_status="pending_review").count()

    return jsonify(
        {
            "total_users": total_users,
            "total_teachers": total_teachers,
            "total_students": total_students,
            "total_courses": total_courses,
            "published_courses": published_courses,
            "pending_reviews": pending_reviews,
            "total_enrollments": total_enrollments,
            "total_revenue": round(float(total_revenue), 2),
        }
    )


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    role = request.args.get("role")
    search = request.args.get("search", "")
    query = User.query.filter(User.role != "admin")
    if role:
        query = query.filter_by(role=role)
    if search:
        query = query.filter(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    users = query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users])


@admin_bp.route("/users/<int:user_id>/toggle-active", methods=["PATCH"])
@jwt_required()
def toggle_user_active(user_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    target = User.query.get_or_404(user_id)
    if target.role == "admin":
        return jsonify({"error": "Cannot modify admin account"}), 400

    target.is_active = not target.is_active
    db.session.commit()
    status = "activated" if target.is_active else "deactivated"
    return jsonify({"message": f"User {status}", "is_active": target.is_active})


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    target = User.query.get_or_404(user_id)
    if target.role == "admin":
        return jsonify({"error": "Cannot delete admin account"}), 400

    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "User deleted"})


@admin_bp.route("/courses", methods=["GET"])
@jwt_required()
def list_all_courses():
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    courses = Course.query.order_by(Course.created_at.desc()).all()
    return jsonify([course.to_dict() for course in courses])


@admin_bp.route("/courses/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})


@admin_bp.route("/courses/review", methods=["GET"])
@jwt_required()
def review_courses():
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    status = request.args.get("status")
    query = Course.query
    if status:
        query = query.filter_by(approval_status=status)
    else:
        query = query.filter(Course.approval_status.in_(["pending_review", "changes_requested", "approved_pending_payment", "rejected", "published"]))
    courses = query.order_by(Course.submitted_at.desc(), Course.created_at.desc()).all()
    return jsonify([course.to_dict() for course in courses])


@admin_bp.route("/courses/<int:course_id>/review", methods=["GET"])
@jwt_required()
def review_course_detail(course_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    course = Course.query.get_or_404(course_id)
    return jsonify(_review_payload(course))


@admin_bp.route("/courses/<int:course_id>/approve", methods=["POST"])
@jwt_required()
def approve_course(course_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}
    publication_fee = float(data.get("publication_fee", 0) or 0)
    review_notes = data.get("review_notes", "").strip()

    course.review_notes = review_notes
    course.reviewed_by_admin_id = user.id
    course.reviewed_at = datetime.utcnow()
    course.publication_fee = publication_fee

    if publication_fee > 0:
        course.approval_status = "approved_pending_payment"
        course.publication_payment_status = "pending"
        course.is_published = False
    else:
        course.publication_fee = 0
        mark_course_published(course)

    db.session.commit()
    return jsonify({"message": "Course review updated", "course": _review_payload(course)})


@admin_bp.route("/courses/<int:course_id>/reject", methods=["POST"])
@jwt_required()
def reject_course(course_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}
    course.approval_status = "rejected"
    course.review_notes = data.get("review_notes", "").strip()
    course.reviewed_by_admin_id = user.id
    course.reviewed_at = datetime.utcnow()
    course.is_published = False
    db.session.commit()
    return jsonify({"message": "Course rejected", "course": _review_payload(course)})


@admin_bp.route("/courses/<int:course_id>/request-changes", methods=["POST"])
@jwt_required()
def request_changes(course_id):
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}
    course.approval_status = "changes_requested"
    course.review_notes = data.get("review_notes", "").strip()
    course.reviewed_by_admin_id = user.id
    course.reviewed_at = datetime.utcnow()
    course.is_published = False
    db.session.commit()
    return jsonify({"message": "Changes requested", "course": _review_payload(course)})
