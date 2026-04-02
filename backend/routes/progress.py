from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Enrollment, ProgressTracking
from datetime import datetime

progress_bp = Blueprint("progress", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


# ─── Get progress for an enrollment ──────────────────────────────────────────
@progress_bp.route("/<int:enrollment_id>", methods=["GET"])
@jwt_required()
def get_progress(enrollment_id):
    user = get_current_user()
    enrollment = Enrollment.query.get_or_404(enrollment_id)

    if user.role == "student" and enrollment.student_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    if user.role == "teacher" and enrollment.course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    total = len(enrollment.course.modules)
    completed = sum(1 for p in enrollment.progress_records if p.is_completed)
    progress_pct = int(completed / total * 100) if total > 0 else 0

    return jsonify({
        "enrollment_id": enrollment_id,
        "total_modules": total,
        "completed_modules": completed,
        "progress_percentage": progress_pct,
        "is_complete": progress_pct == 100,
        "records": [p.to_dict() for p in enrollment.progress_records],
    })


# ─── Mark a module as complete/incomplete ────────────────────────────────────
@progress_bp.route("/toggle", methods=["POST"])
@jwt_required()
def toggle_module():
    user = get_current_user()
    if user.role != "student":
        return jsonify({"error": "Students only"}), 403

    data = request.get_json()
    enrollment_id = data.get("enrollment_id")
    module_id = data.get("module_id")

    if not enrollment_id or not module_id:
        return jsonify({"error": "enrollment_id and module_id required"}), 400

    enrollment = Enrollment.query.get(enrollment_id)
    if not enrollment or enrollment.student_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    record = ProgressTracking.query.filter_by(
        enrollment_id=enrollment_id, module_id=module_id
    ).first()

    if not record:
        # Create it
        record = ProgressTracking(enrollment_id=enrollment_id, module_id=module_id)
        db.session.add(record)

    record.is_completed = not record.is_completed
    record.completed_at = datetime.utcnow() if record.is_completed else None
    db.session.commit()

    total = len(enrollment.course.modules)
    completed = sum(1 for p in enrollment.progress_records if p.is_completed)
    progress_pct = int(completed / total * 100) if total > 0 else 0

    return jsonify({
        "is_completed": record.is_completed,
        "progress_percentage": progress_pct,
        "message": "Module marked as " + ("complete" if record.is_completed else "incomplete"),
    })