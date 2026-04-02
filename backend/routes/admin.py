from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

from extensions import db
from models import User, Course, Enrollment, Payment

admin_bp = Blueprint("admin", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def require_admin(user):
    if user.role != "admin":
        return False
    return True


# ─── Admin: analytics dashboard ──────────────────────────────────────────────
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
    published_courses = Course.query.filter_by(is_published=True).count()
    total_enrollments = Enrollment.query.filter_by(payment_status="paid").count()
    total_revenue = db.session.query(db.func.sum(Payment.amount)).filter(Payment.status == "success").scalar() or 0

    return jsonify({
        "total_users": total_users,
        "total_teachers": total_teachers,
        "total_students": total_students,
        "total_courses": total_courses,
        "published_courses": published_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": round(float(total_revenue), 2),
    })


# ─── Admin: list all users ────────────────────────────────────────────────────
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
    return jsonify([u.to_dict() for u in users])


# ─── Admin: toggle user active status ────────────────────────────────────────
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


# ─── Admin: delete user ───────────────────────────────────────────────────────
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


# ─── Admin: list all courses ──────────────────────────────────────────────────
@admin_bp.route("/courses", methods=["GET"])
@jwt_required()
def list_all_courses():
    user = get_current_user()
    if not require_admin(user):
        return jsonify({"error": "Admin only"}), 403

    courses = Course.query.order_by(Course.created_at.desc()).all()
    return jsonify([c.to_dict() for c in courses])


# ─── Admin: delete course ─────────────────────────────────────────────────────
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
