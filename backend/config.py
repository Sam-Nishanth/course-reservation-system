import os

from sqlalchemy.pool import StaticPool


class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    USE_IN_MEMORY_DB = "DATABASE_URL" not in os.environ
    DATA_DIR = os.environ.get("COURSE_RESERVATION_DATA_DIR", os.path.join(BASE_DIR, "instance"))
    DEFAULT_DB_PATH = os.path.join(DATA_DIR, "course_reservation.sqlite3")
    DEFAULT_DB_URI = "sqlite://" if USE_IN_MEMORY_DB else f"sqlite:///{DEFAULT_DB_PATH.replace(os.sep, '/')}"

    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", DEFAULT_DB_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    SQLALCHEMY_ENGINE_OPTIONS = (
        {
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool,
            "pool_pre_ping": True,
        }
        if USE_IN_MEMORY_DB
        else {}
    )
