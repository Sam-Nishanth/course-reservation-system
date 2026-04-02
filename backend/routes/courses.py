from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Course, CourseModule

courses_bp = Blueprint("courses", __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


# ─── Get categories (static route — must be before /<int:course_id>) ──────────
@courses_bp.route("/categories", methods=["GET"])
def get_categories():
    cats = db.session.query(Course.category).distinct().all()
    return jsonify([c[0] for c in cats if c[0]])


# ─── Teacher: get their own courses (static route) ────────────────────────────
@courses_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def my_courses():
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Only teachers can access this"}), 403
    courses = Course.query.filter_by(teacher_id=user.id).order_by(Course.created_at.desc()).all()
    return jsonify([c.to_dict() for c in courses])


# ─── Public: list all published courses ──────────────────────────────────────
@courses_bp.route("/", methods=["GET"])
def list_published_courses():
    category = request.args.get("category")
    search = request.args.get("search", "")
    sort = request.args.get("sort", "latest")

    query = Course.query.filter_by(is_published=True)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    if sort == "price_asc":
        query = query.order_by(Course.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Course.price.desc())
    elif sort == "popular":
        courses = query.all()
        return jsonify([c.to_dict() for c in sorted(courses, key=lambda c: len(c.enrollments), reverse=True)])
    else:
        query = query.order_by(Course.created_at.desc())

    courses = query.all()
    return jsonify([c.to_dict() for c in courses])


# ─── Teacher: create course ───────────────────────────────────────────────────
@courses_bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    user = get_current_user()
    if user.role != "teacher":
        return jsonify({"error": "Only teachers can create courses"}), 403

    data = request.get_json()
    if not data.get("title", "").strip():
        return jsonify({"error": "Course title is required"}), 400

    course = Course(
        teacher_id=user.id,
        title=data["title"].strip(),
        short_description=data.get("short_description", ""),
        detailed_description=data.get("detailed_description", ""),
        category=data.get("category", "General"),
        price=float(data.get("price", 0)),
        thumbnail_url=data.get("thumbnail_url", ""),
        intro_video_url=data.get("intro_video_url", ""),
        duration=data.get("duration", ""),
        prerequisites=data.get("prerequisites", ""),
        learning_outcomes=data.get("learning_outcomes", ""),
        total_seats=int(data.get("total_seats", 100)),
        is_published=data.get("is_published", False),
    )
    db.session.add(course)
    db.session.flush()

    for i, m in enumerate(data.get("modules", [])):
        mod = CourseModule(
            course_id=course.id,
            week_number=m.get("week_number", i + 1),
            title=m.get("title", f"Week {i + 1}"),
            video_url=m.get("video_url", ""),
            notes=m.get("notes", ""),
            assignment=m.get("assignment", ""),
            duration_minutes=int(m.get("duration_minutes", 0)),
        )
        db.session.add(mod)

    db.session.commit()
    return jsonify({"message": "Course created", "course": course.to_dict(include_modules=True)}), 201


# ─── Public: get one course by ID ────────────────────────────────────────────
@courses_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    return jsonify(course.to_dict(include_modules=True))


# ─── Teacher: update course ───────────────────────────────────────────────────
@courses_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def update_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "teacher" or course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    course.title = data.get("title", course.title).strip()
    course.short_description = data.get("short_description", course.short_description)
    course.detailed_description = data.get("detailed_description", course.detailed_description)
    course.category = data.get("category", course.category)
    course.price = float(data.get("price", course.price))
    course.thumbnail_url = data.get("thumbnail_url", course.thumbnail_url)
    course.intro_video_url = data.get("intro_video_url", course.intro_video_url)
    course.duration = data.get("duration", course.duration)
    course.prerequisites = data.get("prerequisites", course.prerequisites)
    course.learning_outcomes = data.get("learning_outcomes", course.learning_outcomes)
    course.total_seats = int(data.get("total_seats", course.total_seats))
    course.is_published = data.get("is_published", course.is_published)

    if "modules" in data:
        for mod in course.modules:
            db.session.delete(mod)
        db.session.flush()
        for i, m in enumerate(data["modules"]):
            mod = CourseModule(
                course_id=course.id,
                week_number=m.get("week_number", i + 1),
                title=m.get("title", f"Week {i + 1}"),
                video_url=m.get("video_url", ""),
                notes=m.get("notes", ""),
                assignment=m.get("assignment", ""),
                duration_minutes=int(m.get("duration_minutes", 0)),
            )
            db.session.add(mod)

    db.session.commit()
    return jsonify({"message": "Course updated", "course": course.to_dict(include_modules=True)})


# ─── Teacher / Admin: delete course ──────────────────────────────────────────
@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role == "teacher":
        if course.teacher_id != user.id:
            return jsonify({"error": "Unauthorized: you do not own this course"}), 403
    elif user.role == "admin":
        pass  # admin can delete any course
    else:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})


# ─── Teacher: toggle publish/unpublish ───────────────────────────────────────
@courses_bp.route("/<int:course_id>/publish", methods=["PATCH"])
@jwt_required()
def toggle_publish(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "teacher" or course.teacher_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    course.is_published = not course.is_published
    db.session.commit()
    status = "published" if course.is_published else "unpublished"
    return jsonify({"message": f"Course {status}", "is_published": course.is_published})