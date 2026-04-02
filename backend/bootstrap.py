from datetime import datetime, timedelta
import random
import uuid

from extensions import db
from models import Course, CourseModule, Enrollment, Payment, ProgressTracking, User


def seed_demo_data(reset=False):
    if reset:
        db.drop_all()

    db.create_all()

    if not reset and User.query.first():
        return

    admin = User(name="Admin", email="admin@coursehub.com", role="admin", is_active=True)
    admin.set_password("admin123")
    db.session.add(admin)

    teachers_data = [
        {
            "name": "Dr. Priya Sharma",
            "email": "priya@teacher.com",
            "bio": "Expert in Python and data science with a decade of teaching experience.",
            "qualification": "PhD Computer Science, IIT Bombay",
            "expertise": "Python, Data Science, Machine Learning",
        },
        {
            "name": "Prof. Arjun Mehta",
            "email": "arjun@teacher.com",
            "bio": "Full-stack developer turned educator focused on building practical web apps.",
            "qualification": "M.Tech Software Engineering, NIT",
            "expertise": "JavaScript, React, Node.js",
        },
    ]
    teachers = []
    for teacher_data in teachers_data:
        teacher = User(
            name=teacher_data["name"],
            email=teacher_data["email"],
            role="teacher",
            bio=teacher_data["bio"],
            qualification=teacher_data["qualification"],
            expertise=teacher_data["expertise"],
            is_active=True,
        )
        teacher.set_password("teacher123")
        db.session.add(teacher)
        teachers.append(teacher)

    students_data = [
        {"name": "Rahul Verma", "email": "rahul@student.com"},
        {"name": "Sneha Patel", "email": "sneha@student.com"},
    ]
    students = []
    for student_data in students_data:
        student = User(name=student_data["name"], email=student_data["email"], role="student", is_active=True)
        student.set_password("student123")
        db.session.add(student)
        students.append(student)

    db.session.flush()

    courses_data = [
        {
            "teacher": teachers[0],
            "title": "Python for Data Science",
            "short_description": "Master Python programming for data analysis and machine learning.",
            "detailed_description": "Learn Python fundamentals, NumPy, Pandas, visualization, and introductory machine learning.",
            "category": "Data Science",
            "price": 1999.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
            "intro_video_url": "https://www.youtube.com/embed/rfscVS0vtbw",
            "duration": "8 weeks",
            "prerequisites": "Basic computer knowledge",
            "learning_outcomes": "Write Python scripts\nAnalyze data\nCreate charts\nTrain simple ML models",
            "total_seats": 50,
            "is_published": True,
            "modules": [
                {"week": 1, "title": "Python Basics", "notes": "Syntax, variables, and core data types."},
                {"week": 2, "title": "Control Flow", "notes": "Conditionals, loops, and functions."},
                {"week": 3, "title": "Data Structures", "notes": "Lists, tuples, dictionaries, and sets."},
                {"week": 4, "title": "Pandas", "notes": "DataFrames, cleaning, and aggregation."},
            ],
        },
        {
            "teacher": teachers[1],
            "title": "Full Stack Web Development",
            "short_description": "Build modern web applications with React and Node.js.",
            "detailed_description": "Covers HTML, CSS, JavaScript, React, APIs, and backend fundamentals.",
            "category": "Web Development",
            "price": 2499.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
            "intro_video_url": "https://www.youtube.com/embed/nu_pCVPKzTk",
            "duration": "10 weeks",
            "prerequisites": "Basic HTML and CSS knowledge",
            "learning_outcomes": "Build React apps\nCreate APIs\nManage app state\nShip projects",
            "total_seats": 40,
            "is_published": True,
            "modules": [
                {"week": 1, "title": "HTML and CSS Review", "notes": "Semantic HTML and modern CSS layouts."},
                {"week": 2, "title": "JavaScript ES6+", "notes": "Modern syntax, async flows, and tooling."},
                {"week": 3, "title": "React Fundamentals", "notes": "Components, props, state, and hooks."},
            ],
        },
        {
            "teacher": teachers[0],
            "title": "Machine Learning Bootcamp",
            "short_description": "A deeper dive into practical machine learning techniques.",
            "detailed_description": "An unpublished draft course for teacher-side management flows.",
            "category": "Data Science",
            "price": 3499.0,
            "thumbnail_url": "",
            "intro_video_url": "",
            "duration": "12 weeks",
            "prerequisites": "Python for Data Science or equivalent",
            "learning_outcomes": "Implement ML algorithms\nEvaluate models\nWork with real datasets",
            "total_seats": 25,
            "is_published": False,
            "modules": [
                {"week": 1, "title": "ML Fundamentals", "notes": "Bias, variance, and data preparation."},
                {"week": 2, "title": "Regression and Classification", "notes": "Core supervised learning workflows."},
            ],
        },
    ]

    courses = []
    for course_data in courses_data:
        course = Course(
            teacher_id=course_data["teacher"].id,
            title=course_data["title"],
            short_description=course_data["short_description"],
            detailed_description=course_data["detailed_description"],
            category=course_data["category"],
            price=course_data["price"],
            thumbnail_url=course_data["thumbnail_url"],
            intro_video_url=course_data["intro_video_url"],
            duration=course_data["duration"],
            prerequisites=course_data["prerequisites"],
            learning_outcomes=course_data["learning_outcomes"],
            total_seats=course_data["total_seats"],
            is_published=course_data["is_published"],
        )
        db.session.add(course)
        db.session.flush()

        for module_data in course_data["modules"]:
            db.session.add(
                CourseModule(
                    course_id=course.id,
                    week_number=module_data["week"],
                    title=module_data["title"],
                    video_url=course_data["intro_video_url"],
                    notes=module_data["notes"],
                    assignment=f"Complete the exercise for {module_data['title']}.",
                    duration_minutes=random.randint(30, 75),
                )
            )
        courses.append(course)

    db.session.flush()

    enrollments_config = [
        (students[0], courses[0], 2),
        (students[0], courses[1], 1),
        (students[1], courses[0], 4),
    ]

    for student, course, modules_completed in enrollments_config:
        enrolled_at = datetime.utcnow() - timedelta(days=random.randint(2, 21))
        enrollment = Enrollment(
            student_id=student.id,
            course_id=course.id,
            payment_status="paid",
            enrolled_at=enrolled_at,
        )
        db.session.add(enrollment)
        db.session.flush()

        db.session.add(
            Payment(
                enrollment_id=enrollment.id,
                student_id=student.id,
                course_id=course.id,
                amount=course.price,
                status="success",
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                payment_method="mock_card",
                paid_at=enrolled_at,
            )
        )

        for index, module in enumerate(course.modules):
            is_completed = index < modules_completed
            db.session.add(
                ProgressTracking(
                    enrollment_id=enrollment.id,
                    module_id=module.id,
                    is_completed=is_completed,
                    completed_at=enrolled_at + timedelta(days=index) if is_completed else None,
                )
            )

    db.session.commit()
