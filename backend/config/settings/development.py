"""
Settings de développement — DEBUG activé, SQLite, CORS large.
"""

from dotenv import load_dotenv

load_dotenv()

from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# En dev, les emails s'affichent dans la console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
