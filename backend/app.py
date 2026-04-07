import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from bootstrap import seed_demo_data
from config import Config
from extensions import db, jwt
from routes.auth import auth_bp
from routes.course_workflow import courses_bp
from routes.enrollment_status import enrollments_bp
from routes.progress import progress_bp
from routes.teacher_workflow import teacher_bp
from routes.admin_review import admin_bp

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    os.makedirs(app.instance_path, exist_ok=True)
    if not Config.USE_IN_MEMORY_DB:
        os.makedirs(Config.DATA_DIR, exist_ok=True)

    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(enrollments_bp, url_prefix="/api/enrollments")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        seed_demo_data()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
