from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bio = db.Column(db.Text, default="")
    qualification = db.Column(db.String(200), default="")
    expertise = db.Column(db.String(200), default="")
    profile_photo = db.Column(db.String(500), default="")
    learning_preferences = db.Column(db.String(500), default="")
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
    reviewed_by_admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    title = db.Column(db.String(300), nullable=False)
    short_description = db.Column(db.String(500), default="")
    detailed_description = db.Column(db.Text, default="")
    category = db.Column(db.String(100), default="General")
    price = db.Column(db.Float, default=0.0)
    duration = db.Column(db.String(100), default="")
    duration_weeks = db.Column(db.Integer, default=0)
    schedule = db.Column(db.Text, default="")
    resources = db.Column(db.Text, default="")
    thumbnail_url = db.Column(db.String(500), default="")
    intro_video_url = db.Column(db.String(500), default="")
    video_links = db.Column(db.Text, default="")
    prerequisites = db.Column(db.Text, default="")
    learning_outcomes = db.Column(db.Text, default="")
    total_seats = db.Column(db.Integer, default=100)
    approval_status = db.Column(db.String(50), default="draft", nullable=False)
    review_notes = db.Column(db.Text, default="")
    submitted_at = db.Column(db.DateTime, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    publication_fee = db.Column(db.Float, default=0.0)
    publication_payment_status = db.Column(db.String(50), default="not_required")
    published_at = db.Column(db.DateTime, nullable=True)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher = db.relationship("User", foreign_keys=[teacher_id], backref="courses")
    reviewed_by_admin = db.relationship("User", foreign_keys=[reviewed_by_admin_id])
    modules = db.relationship(
        "CourseModule",
        backref="course",
        cascade="all, delete-orphan",
        order_by="CourseModule.week_number",
    )
    enrollments = db.relationship("Enrollment", backref="course", cascade="all, delete-orphan")
    payments = db.relationship("Payment", backref="course", cascade="all, delete-orphan")
    chat_messages = db.relationship("CourseChatMessage", backref="course", cascade="all, delete-orphan")

    def to_dict(self, include_modules=False, include_chat=False):
        data = {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "teacher_name": self.teacher.name if self.teacher else "",
            "title": self.title,
            "short_description": self.short_description,
            "detailed_description": self.detailed_description,
            "category": self.category,
            "price": self.price,
            "fee": self.price,
            "duration": self.duration,
            "duration_weeks": self.duration_weeks,
            "schedule": self.schedule,
            "resources": self.resources,
            "thumbnail_url": self.thumbnail_url,
            "intro_video_url": self.intro_video_url,
            "video_links": self.video_links,
            "prerequisites": self.prerequisites,
            "learning_outcomes": self.learning_outcomes,
            "total_seats": self.total_seats,
            "approval_status": self.approval_status,
            "review_notes": self.review_notes,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "reviewed_by_admin_id": self.reviewed_by_admin_id,
            "publication_fee": self.publication_fee,
            "publication_payment_status": self.publication_payment_status,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "enrollment_count": len([enrollment for enrollment in self.enrollments if enrollment.status == "enrolled"]),
        }
        if include_modules:
            data["modules"] = [module.to_dict() for module in self.modules]
        if include_chat:
            data["chat_messages"] = [message.to_dict() for message in self.chat_messages]
        return data


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
    payment_id = db.Column(db.Integer, db.ForeignKey("payments.id"), nullable=True)
    status = db.Column(db.String(50), default="pending_payment")
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_status = db.Column(db.String(50), default="pending")
    teacher_remarks = db.Column(db.Text, default="")

    student = db.relationship("User", backref="enrollments")
    payment = db.relationship("Payment", foreign_keys=[payment_id], uselist=False)
    progress_records = db.relationship("ProgressTracking", backref="enrollment", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else "",
            "student_email": self.student.email if self.student else "",
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else "",
            "payment_id": self.payment_id,
            "status": self.status,
            "enrolled_at": self.enrolled_at.isoformat(),
            "payment_status": self.payment_status,
            "teacher_remarks": self.teacher_remarks,
        }


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=True)
    payment_type = db.Column(db.String(50), nullable=False)
    razorpay_order_id = db.Column(db.String(120), unique=True, nullable=True)
    razorpay_payment_id = db.Column(db.String(120), unique=True, nullable=True)
    razorpay_signature = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="INR")
    status = db.Column(db.String(50), default="created")
    signature_verified = db.Column(db.Boolean, default=False)
    gateway_name = db.Column(db.String(50), default="razorpay")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", backref="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else "",
            "enrollment_id": self.enrollment_id,
            "payment_type": self.payment_type,
            "razorpay_order_id": self.razorpay_order_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "transaction_id": self.razorpay_payment_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "signature_verified": self.signature_verified,
            "payment_method": self.gateway_name,
            "paid_at": self.verified_at.isoformat() if self.verified_at else None,
            "created_at": self.created_at.isoformat(),
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


class CourseChatMessage(db.Model):
    __tablename__ = "course_chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("User", backref="course_chat_messages")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
        }
