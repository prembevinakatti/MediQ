from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.db.mongodb import users_collection
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_user_by_email,
)
from fastapi import Depends

from app.core.security import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
)
def register(request: RegisterRequest):

    # Check existing user
    existing_user = get_user_by_email(
        request.email
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Hash password
    password_hash = hash_password(
        request.password
    )

    # Create user
    user = {
        "name": request.name,
        "email": request.email.lower(),
        "password_hash": password_hash,
        "created_at": datetime.now(
            timezone.utc
        ),
    }

    result = users_collection.insert_one(
        user
    )

    user_id = str(result.inserted_id)

    token = create_access_token(
        user_id
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user_id,
        "name": request.name,
        "email": request.email.lower(),
    }


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(request: LoginRequest):

    user = get_user_by_email(
        request.email
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    valid_password = verify_password(
        request.password,
        user["password_hash"],
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        str(user["_id"])
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }

@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):

    return {
        "user_id": str(
            current_user["_id"]
        ),
        "name": current_user["name"],
        "email": current_user["email"],
    }