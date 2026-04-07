from datetime import datetime

from models import CourseModule, Enrollment


TEACHER_EDITABLE_STATUSES = {"draft", "changes_requested", "rejected"}


def apply_course_payload(course, data):
    course.title = data.get("title", course.title).strip()
    course.short_description = data.get("short_description", course.short_description)
    course.detailed_description = data.get("detailed_description", course.detailed_description)
    course.category = data.get("category", course.category)
    course.price = float(data.get("price", course.price or 0))
    course.duration = data.get("duration", course.duration)
    course.duration_weeks = int(data.get("duration_weeks", course.duration_weeks or 0) or 0)
    course.schedule = data.get("schedule", course.schedule)
    course.resources = data.get("resources", course.resources)
    course.thumbnail_url = data.get("thumbnail_url", course.thumbnail_url)
    course.intro_video_url = data.get("intro_video_url", course.intro_video_url)
    course.video_links = data.get("video_links", course.video_links)
    course.prerequisites = data.get("prerequisites", course.prerequisites)
    course.learning_outcomes = data.get("learning_outcomes", course.learning_outcomes)
    course.total_seats = int(data.get("total_seats", course.total_seats or 1) or 1)


def replace_modules(db, course, modules):
    for existing_module in list(course.modules):
        db.session.delete(existing_module)
    db.session.flush()

    for index, module_data in enumerate(modules):
        db.session.add(
            CourseModule(
                course_id=course.id,
                week_number=int(module_data.get("week_number", index + 1) or index + 1),
                title=module_data.get("title", f"Week {index + 1}"),
                video_url=module_data.get("video_url", ""),
                notes=module_data.get("notes", ""),
                assignment=module_data.get("assignment", ""),
                duration_minutes=int(module_data.get("duration_minutes", 0) or 0),
            )
        )


def validate_course_for_review(course):
    if not course.title.strip():
        return "Course title is required"
    if not course.detailed_description.strip():
        return "Detailed description is required before review"
    if not course.modules:
        return "Add at least one module before submitting for review"
    return None


def can_teacher_edit(course):
    return course.approval_status in TEACHER_EDITABLE_STATUSES and not course.is_published


def can_view_course(user, course):
    if course.is_published:
        return True
    if user is None:
        return False
    if user.role == "admin":
        return True
    if user.role == "teacher" and course.teacher_id == user.id:
        return True
    if user.role == "student":
        return (
            Enrollment.query.filter_by(student_id=user.id, course_id=course.id, status="enrolled").first()
            is not None
        )
    return False


def compact_course_context(course):
    module_lines = [
        f"Week {module.week_number}: {module.title}. Notes: {module.notes[:180]}. Video: {module.video_url or 'N/A'}"
        for module in course.modules[:8]
    ]
    return "\n".join(
        [
            f"Title: {course.title}",
            f"Short description: {course.short_description}",
            f"Detailed description: {course.detailed_description[:1200]}",
            f"Duration: {course.duration or course.duration_weeks or 'Not specified'}",
            f"Schedule: {course.schedule or 'Not specified'}",
            f"Resources: {course.resources or 'Not specified'}",
            f"Intro video: {course.intro_video_url or 'Not specified'}",
            f"Additional video links: {course.video_links or 'Not specified'}",
            f"Prerequisites: {course.prerequisites or 'Not specified'}",
            f"Learning outcomes: {course.learning_outcomes or 'Not specified'}",
            "Modules:",
            *module_lines,
        ]
    )


def mark_course_published(course):
    course.approval_status = "published"
    course.publication_payment_status = "paid" if course.publication_fee > 0 else "not_required"
    course.is_published = True
    course.published_at = datetime.utcnow()
