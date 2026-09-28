from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from bson import ObjectId

from app.core.config import settings
from app.db.mongodb import users_collection


def hash_password(password: str) -> str:

    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    hashed_password: str,
) -> bool:

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(
    user_id: str,
) -> str:

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=settings.JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def get_user_by_email(email: str):

    return users_collection.find_one(
        {
            "email": email.lower()
        }
    )


def get_user_by_id(user_id: str):

    return users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )