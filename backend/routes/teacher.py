from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Course, Enrollment

teacher_bp = Blueprint("teacher", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


# ─── Teacher: see students enrolled in their courses ─────────────────────────
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
            if enrollment.payment_status != "paid":
                continue
            total = len(course.modules)
            completed = sum(1 for p in enrollment.progress_records if p.is_completed)
            progress_pct = int(completed / total * 100) if total > 0 else 0
            students.append({
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
            })
        result.append({
            "course_id": course.id,
            "course_title": course.title,
            "enrollment_count": len(students),
            "students": students,
        })
    return jsonify(result)


# ─── Teacher: update remarks for a student enrollment ────────────────────────
@teacher_bp.route("/remarks/<int:enrollment_id>", methods=["PUT"])
@jwt_required()
def update_remarks(enrollment_id):
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    enrollment = Enrollment.query.get_or_404(enrollment_id)
    if enrollment.course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    enrollment.teacher_remarks = data.get("remarks", enrollment.teacher_remarks)
    db.session.commit()
    return jsonify({"message": "Remarks updated", "remarks": enrollment.teacher_remarks})


# ─── Teacher: dashboard stats ─────────────────────────────────────────────────
@teacher_bp.route("/stats", methods=["GET"])
@jwt_required()
def teacher_stats():
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Teachers only"}), 403

    courses = Course.query.filter_by(teacher_id=user.id).all()
    total_courses = len(courses)
    published = sum(1 for c in courses if c.is_published)
    total_students = sum(
        len([e for e in c.enrollments if e.payment_status == "paid"]) for c in courses
    )
    total_revenue = sum(
        sum(e.payment.amount for e in c.enrollments if e.payment and e.payment.status == "success")
        for c in courses
    )
    return jsonify({
        "total_courses": total_courses,
        "published_courses": published,
        "total_students": total_students,
        "total_revenue": round(total_revenue, 2),
    })