from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'teacher', 'admin'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Teacher-specific fields
    bio = db.Column(db.Text, default="")
    qualification = db.Column(db.String(200), default="")
    expertise = db.Column(db.String(200), default="")
    profile_photo = db.Column(db.String(500), default="")

    # Student-specific fields
    learning_preferences = db.Column(db.String(500), default="")

    # Notification preferences (JSON string)
    notifications_enabled = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "bio": self.bio,
            "qualification": self.qualification,
            "expertise": self.expertise,
            "profile_photo": self.profile_photo,
            "learning_preferences": self.learning_preferences,
            "notifications_enabled": self.notifications_enabled,
        }


class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    short_description = db.Column(db.String(500), default="")
    detailed_description = db.Column(db.Text, default="")
    category = db.Column(db.String(100), default="General")
    price = db.Column(db.Float, default=0.0)
    thumbnail_url = db.Column(db.String(500), default="")
    intro_video_url = db.Column(db.String(500), default="")
    duration = db.Column(db.String(100), default="")
    prerequisites = db.Column(db.Text, default="")
    learning_outcomes = db.Column(db.Text, default="")
    total_seats = db.Column(db.Integer, default=100)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher = db.relationship("User", backref="courses")
    modules = db.relationship("CourseModule", backref="course", cascade="all, delete-orphan", order_by="CourseModule.week_number")
    enrollments = db.relationship("Enrollment", backref="course", cascade="all, delete-orphan")

    def to_dict(self, include_modules=False):
        d = {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "teacher_name": self.teacher.name if self.teacher else "",
            "title": self.title,
            "short_description": self.short_description,
            "detailed_description": self.detailed_description,
            "category": self.category,
            "price": self.price,
            "thumbnail_url": self.thumbnail_url,
            "intro_video_url": self.intro_video_url,
            "duration": self.duration,
            "prerequisites": self.prerequisites,
            "learning_outcomes": self.learning_outcomes,
            "total_seats": self.total_seats,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat(),
            "enrollment_count": len(self.enrollments),
        }
        if include_modules:
            d["modules"] = [m.to_dict() for m in self.modules]
        return d


class CourseModule(db.Model):
    __tablename__ = "course_modules"
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    week_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(300), nullable=False)
    video_url = db.Column(db.String(500), default="")
    notes = db.Column(db.Text, default="")
    assignment = db.Column(db.Text, default="")
    duration_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "week_number": self.week_number,
            "title": self.title,
            "video_url": self.video_url,
            "notes": self.notes,
            "assignment": self.assignment,
            "duration_minutes": self.duration_minutes,
        }


class Enrollment(db.Model):
    __tablename__ = "enrollments"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_status = db.Column(db.String(50), default="pending")  # pending, paid, failed
    teacher_remarks = db.Column(db.Text, default="")

    student = db.relationship("User", backref="enrollments")
    payment = db.relationship("Payment", backref="enrollment", uselist=False)
    progress_records = db.relationship("ProgressTracking", backref="enrollment", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else "",
            "student_email": self.student.email if self.student else "",
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else "",
            "enrolled_at": self.enrolled_at.isoformat(),
            "payment_status": self.payment_status,
            "teacher_remarks": self.teacher_remarks,
        }


class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="success")  # success, failed
    transaction_id = db.Column(db.String(100), unique=True)
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), default="mock_card")

    student = db.relationship("User", backref="payments")
    course = db.relationship("Course", backref="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "enrollment_id": self.enrollment_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else "",
            "amount": self.amount,
            "status": self.status,
            "transaction_id": self.transaction_id,
            "paid_at": self.paid_at.isoformat(),
            "payment_method": self.payment_method,
        }


class ProgressTracking(db.Model):
    __tablename__ = "progress_tracking"
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey("course_modules.id"), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    module = db.relationship("CourseModule")

    def to_dict(self):
        return {
            "id": self.id,
            "enrollment_id": self.enrollment_id,
            "module_id": self.module_id,
            "module_title": self.module.title if self.module else "",
            "is_completed": self.is_completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }