"""
Run this script to seed the database with sample data.
Usage: python seed.py
"""
from app import create_app
from extensions import db
from models import User, Course, CourseModule, Enrollment, Payment, ProgressTracking
import uuid
from datetime import datetime, timedelta
import random


app = create_app()

with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()

    print("🌱 Seeding database...")

    # ── Admin ──────────────────────────────────────────────────────────────────
    admin = User(name="Admin", email="admin@coursehub.com", role="admin", is_active=True)
    admin.set_password("admin123")
    db.session.add(admin)

    # ── Teachers ───────────────────────────────────────────────────────────────
    teachers_data = [
        {
            "name": "Dr. Priya Sharma",
            "email": "priya@teacher.com",
            "bio": "Expert in Python and Data Science with 10+ years of teaching experience.",
            "qualification": "PhD Computer Science, IIT Bombay",
            "expertise": "Python, Data Science, Machine Learning",
        },
        {
            "name": "Prof. Arjun Mehta",
            "email": "arjun@teacher.com",
            "bio": "Full-stack developer turned educator. Passionate about web technologies.",
            "qualification": "M.Tech Software Engineering, NIT",
            "expertise": "JavaScript, React, Node.js",
        },
        {
            "name": "Dr. Lakshmi Nair",
            "email": "lakshmi@teacher.com",
            "bio": "Digital marketing professional with expertise in modern marketing strategies.",
            "qualification": "MBA Marketing, IIM Ahmedabad",
            "expertise": "Digital Marketing, SEO, Social Media",
        },
    ]
    teachers = []
    for td in teachers_data:
        t = User(
            name=td["name"],
            email=td["email"],
            role="teacher",
            bio=td["bio"],
            qualification=td["qualification"],
            expertise=td["expertise"],
            is_active=True,
        )
        t.set_password("teacher123")
        db.session.add(t)
        teachers.append(t)

    # ── Students ───────────────────────────────────────────────────────────────
    students_data = [
        {"name": "Rahul Verma", "email": "rahul@student.com"},
        {"name": "Sneha Patel", "email": "sneha@student.com"},
        {"name": "Amit Joshi", "email": "amit@student.com"},
        {"name": "Divya Krishnan", "email": "divya@student.com"},
        {"name": "Karan Singh", "email": "karan@student.com"},
    ]
    students = []
    for sd in students_data:
        s = User(name=sd["name"], email=sd["email"], role="student", is_active=True)
        s.set_password("student123")
        db.session.add(s)
        students.append(s)

    db.session.flush()

    # ── Courses ────────────────────────────────────────────────────────────────
    courses_data = [
        {
            "teacher": teachers[0],
            "title": "Python for Data Science",
            "short_description": "Master Python programming for data analysis and machine learning.",
            "detailed_description": "This comprehensive course covers Python fundamentals, NumPy, Pandas, Matplotlib, and introductory machine learning with scikit-learn. Perfect for beginners and intermediate learners.",
            "category": "Data Science",
            "price": 1999.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
            "intro_video_url": "https://www.youtube.com/embed/rfscVS0vtbw",
            "duration": "8 weeks",
            "prerequisites": "Basic computer knowledge",
            "learning_outcomes": "Write Python scripts\nAnalyze data with Pandas\nCreate visualizations\nBuild ML models",
            "total_seats": 50,
            "is_published": True,
            "modules": [
                {"week": 1, "title": "Python Basics", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Introduction to Python syntax, variables, and data types.", "assignment": "Write a Python program to calculate the sum of a list."},
                {"week": 2, "title": "Control Flow & Functions", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Learn if-else, loops, and define reusable functions.", "assignment": "Build a simple calculator function."},
                {"week": 3, "title": "Data Structures", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Lists, tuples, dictionaries, and sets in Python.", "assignment": "Create a student grade tracker."},
                {"week": 4, "title": "NumPy Fundamentals", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Arrays, broadcasting, and numerical operations.", "assignment": "Perform matrix operations using NumPy."},
                {"week": 5, "title": "Pandas for Data Analysis", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "DataFrames, data cleaning, and aggregation.", "assignment": "Analyze a CSV dataset of your choice."},
                {"week": 6, "title": "Data Visualization", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Matplotlib and Seaborn for charts and plots.", "assignment": "Create 5 different charts from a dataset."},
                {"week": 7, "title": "Intro to Machine Learning", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Scikit-learn basics: classification and regression.", "assignment": "Train a linear regression model."},
                {"week": 8, "title": "Capstone Project", "video": "https://www.youtube.com/embed/rfscVS0vtbw", "notes": "Build an end-to-end data science project.", "assignment": "Submit a complete data analysis report."},
            ],
        },
        {
            "teacher": teachers[1],
            "title": "Full Stack Web Development",
            "short_description": "Build modern web applications with React and Node.js.",
            "detailed_description": "Learn to build complete web applications from front to back. Covers HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB. Deploy your projects on the cloud.",
            "category": "Web Development",
            "price": 2499.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
            "intro_video_url": "https://www.youtube.com/embed/nu_pCVPKzTk",
            "duration": "12 weeks",
            "prerequisites": "Basic HTML/CSS knowledge",
            "learning_outcomes": "Build React applications\nCreate REST APIs\nManage databases\nDeploy to cloud",
            "total_seats": 40,
            "is_published": True,
            "modules": [
                {"week": 1, "title": "HTML & CSS Review", "video": "https://www.youtube.com/embed/qz0aGYrrlhU", "notes": "Semantic HTML5, CSS3, Flexbox and Grid.", "assignment": "Build a responsive landing page."},
                {"week": 2, "title": "JavaScript ES6+", "video": "https://www.youtube.com/embed/NCwa_xi0Uuc", "notes": "Arrow functions, destructuring, promises, async/await.", "assignment": "Build a To-Do list with vanilla JS."},
                {"week": 3, "title": "React Fundamentals", "video": "https://www.youtube.com/embed/Ke90Tje7VS0", "notes": "Components, props, state, and hooks.", "assignment": "Build a weather widget in React."},
                {"week": 4, "title": "React Advanced", "video": "https://www.youtube.com/embed/35lXWvCuM8o", "notes": "Context API, useReducer, custom hooks.", "assignment": "Build a shopping cart with Context."},
                {"week": 5, "title": "Node.js & Express", "video": "https://www.youtube.com/embed/Oe421EPjeBE", "notes": "Server-side JavaScript, REST API creation.", "assignment": "Build a CRUD REST API."},
                {"week": 6, "title": "MongoDB & Mongoose", "video": "https://www.youtube.com/embed/-56x56UppqQ", "notes": "NoSQL databases, schemas, and queries.", "assignment": "Connect your API to MongoDB."},
            ],
        },
        {
            "teacher": teachers[2],
            "title": "Digital Marketing Masterclass",
            "short_description": "Learn SEO, social media marketing, and paid advertising.",
            "detailed_description": "A practical course on modern digital marketing. Learn SEO strategies, Google Ads, Facebook Ads, email marketing, content marketing, and analytics.",
            "category": "Marketing",
            "price": 1499.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600",
            "intro_video_url": "https://www.youtube.com/embed/bixR-KIJKYM",
            "duration": "6 weeks",
            "prerequisites": "None",
            "learning_outcomes": "Rank on Google\nRun paid ads\nGrow social media\nMeasure ROI",
            "total_seats": 60,
            "is_published": True,
            "modules": [
                {"week": 1, "title": "Introduction to Digital Marketing", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "Overview of digital marketing channels and strategy.", "assignment": "Audit a competitor's online presence."},
                {"week": 2, "title": "SEO Fundamentals", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "On-page, off-page SEO, keyword research.", "assignment": "Optimize a webpage for 3 keywords."},
                {"week": 3, "title": "Social Media Marketing", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "Content strategy for Instagram, Facebook, LinkedIn.", "assignment": "Create a 30-day social media calendar."},
                {"week": 4, "title": "Google Ads", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "Search, display, and video ad campaigns.", "assignment": "Set up a mock Google Ads campaign."},
                {"week": 5, "title": "Email Marketing", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "Mailchimp, automation, A/B testing.", "assignment": "Write a 5-email welcome sequence."},
                {"week": 6, "title": "Analytics & Reporting", "video": "https://www.youtube.com/embed/bixR-KIJKYM", "notes": "Google Analytics 4, tracking conversions.", "assignment": "Create a marketing dashboard report."},
            ],
        },
        {
            "teacher": teachers[0],
            "title": "Machine Learning Bootcamp",
            "short_description": "Deep dive into machine learning algorithms and applications.",
            "detailed_description": "Advanced machine learning course covering supervised and unsupervised learning, deep learning, and real-world projects.",
            "category": "Data Science",
            "price": 3499.0,
            "thumbnail_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
            "intro_video_url": "https://www.youtube.com/embed/rfscVS0vtbw",
            "duration": "10 weeks",
            "prerequisites": "Python for Data Science or equivalent",
            "learning_outcomes": "Implement ML algorithms\nBuild neural networks\nDeploy ML models\nWork with real datasets",
            "total_seats": 30,
            "is_published": False,  # Draft course
            "modules": [
                {"week": 1, "title": "ML Fundamentals", "video": "", "notes": "Types of ML, bias-variance tradeoff.", "assignment": ""},
                {"week": 2, "title": "Linear & Logistic Regression", "video": "", "notes": "Core algorithms from scratch.", "assignment": ""},
            ],
        },
    ]

    courses = []
    for cd in courses_data:
        teacher = cd["teacher"]
        course = Course(
            teacher_id=teacher.id,
            title=cd["title"],
            short_description=cd["short_description"],
            detailed_description=cd["detailed_description"],
            category=cd["category"],
            price=cd["price"],
            thumbnail_url=cd["thumbnail_url"],
            intro_video_url=cd["intro_video_url"],
            duration=cd["duration"],
            prerequisites=cd["prerequisites"],
            learning_outcomes=cd["learning_outcomes"],
            total_seats=cd["total_seats"],
            is_published=cd["is_published"],
        )
        db.session.add(course)
        db.session.flush()
        for m in cd["modules"]:
            mod = CourseModule(
                course_id=course.id,
                week_number=m["week"],
                title=m["title"],
                video_url=m.get("video", ""),
                notes=m.get("notes", ""),
                assignment=m.get("assignment", ""),
                duration_minutes=random.randint(30, 90),
            )
            db.session.add(mod)
        courses.append(course)

    db.session.flush()

    # ── Enrollments & Payments ─────────────────────────────────────────────────
    enrollments_config = [
        (students[0], courses[0], 5),   # Rahul: Python - 5 modules done
        (students[0], courses[1], 2),   # Rahul: Web Dev - 2 modules done
        (students[1], courses[0], 8),   # Sneha: Python - all done
        (students[1], courses[2], 3),   # Sneha: Marketing - 3 done
        (students[2], courses[1], 0),   # Amit: Web Dev - just started
        (students[3], courses[2], 6),   # Divya: Marketing - all done
        (students[4], courses[0], 1),   # Karan: Python - 1 done
    ]

    for student, course, modules_completed in enrollments_config:
        enrollment = Enrollment(
            student_id=student.id,
            course_id=course.id,
            payment_status="paid",
            enrolled_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        db.session.add(enrollment)
        db.session.flush()

        txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment(
            enrollment_id=enrollment.id,
            student_id=student.id,
            course_id=course.id,
            amount=course.price,
            status="success",
            transaction_id=txn_id,
            payment_method="mock_card",
            paid_at=enrollment.enrolled_at,
        )
        db.session.add(payment)

        # Track progress
        for i, module in enumerate(course.modules):
            p = ProgressTracking(
                enrollment_id=enrollment.id,
                module_id=module.id,
                is_completed=i < modules_completed,
                completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 10)) if i < modules_completed else None,
            )
            db.session.add(p)

    db.session.commit()
    print("✅ Database seeded successfully!")
    print("\n📋 Login credentials:")
    print("  Admin:   admin@coursehub.com  / admin123")
    print("  Teacher: priya@teacher.com    / teacher123")
    print("  Teacher: arjun@teacher.com    / teacher123")
    print("  Teacher: lakshmi@teacher.com  / teacher123")
    print("  Student: rahul@student.com    / student123")
    print("  Student: sneha@student.com    / student123")