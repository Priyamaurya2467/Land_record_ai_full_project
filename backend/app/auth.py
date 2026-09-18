from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models
from .config import settings
from .database import get_db


# ============================================================
# PASSWORD HASHING
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Create a bcrypt password hash.
    """
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# ============================================================
# OAUTH2
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ============================================================
# AUTHENTICATE USER
# ============================================================

def authenticate_user(
    db: Session,
    username: str,
    password: str
):
    user = (
        db.query(models.User)
        .filter(models.User.username == username)
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password
    ):
        return None

    return user


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(
            minutes=settings.access_token_expire_minutes
        )
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm="HS256"
    )

    return encoded_jwt


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"]
        )

        username = payload.get("sub")

        if not username:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(models.User)
        .filter(models.User.username == username)
        .first()
    )

    if not user:
        raise credentials_exception

    return user


# ============================================================
# ROLE CHECK
# ============================================================

def require_role(*roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):
        user_role = current_user.role.value

        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return role_checker


# ============================================================
# AUTH ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER REQUEST
# ============================================================

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: models.UserRole = models.UserRole.viewer


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # Check whether username already exists
    existing_user = (
        db.query(models.User)
        .filter(
            models.User.username == user_data.username
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Hash password
    hashed_password = get_password_hash(
        user_data.password
    )

    # Create user
    new_user = models.User(
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "role": new_user.role.value,
        },
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    access_token = create_access_token(
        data={
            "sub": user.username
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
        }
    }