import os

from dotenv import load_dotenv
from sqlalchemy.pool import StaticPool

load_dotenv()


def get_env(name, default=None, required=False):
    value = os.getenv(name, default)
    if required and (value is None or str(value).strip() == ""):
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    USE_IN_MEMORY_DB = "DATABASE_URL" not in os.environ
    DATA_DIR = get_env("COURSE_RESERVATION_DATA_DIR", os.path.join(BASE_DIR, "instance"))
    DEFAULT_DB_PATH = os.path.join(DATA_DIR, "course_reservation.sqlite3")
    DEFAULT_DB_URI = "sqlite://" if USE_IN_MEMORY_DB else f"sqlite:///{DEFAULT_DB_PATH.replace(os.sep, '/')}"

    SECRET_KEY = get_env("SECRET_KEY", "super-secret-key-change-in-production")
    SQLALCHEMY_DATABASE_URI = get_env("DATABASE_URL", DEFAULT_DB_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = get_env("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    RAZORPAY_KEY_ID = get_env("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = get_env("RAZORPAY_KEY_SECRET")
    XAI_API_KEY = get_env("XAI_API_KEY")
    XAI_MODEL = get_env("XAI_MODEL", "grok-3-mini")
    SQLALCHEMY_ENGINE_OPTIONS = (
        {
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool,
            "pool_pre_ping": True,
        }
        if USE_IN_MEMORY_DB
        else {}
    )
