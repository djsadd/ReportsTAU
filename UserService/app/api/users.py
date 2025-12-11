from time import time
from typing import Any

import jwt
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.authz.telegram import validate_telegram_auth
from app.core.db import get_db
from app.core.security import create_jwt, create_refresh_jwt, decode_refresh_jwt
from app.models.user import User
from app.schemas.telegram import TelegramAuth
from app.schemas.user import User as UserSchema, UserCreate

router = APIRouter()


class LoginById(BaseModel):
    telegram_id: int


class RefreshTokenPayload(BaseModel):
    refresh_token: str


async def _extract_telegram_payload(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        return await request.json()
    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        return dict(form)
    return dict(request.query_params)


async def _parse_telegram_auth(request: Request) -> TelegramAuth:
    payload = await _extract_telegram_payload(request)
    return TelegramAuth(**payload)


def _sync_telegram_user(db: Session, telegram_data: TelegramAuth) -> User:
    user = db.query(User).filter(User.telegram_id == telegram_data.id).first()
    if not user:
        user = User(
            telegram_id=telegram_data.id,
            first_name=telegram_data.first_name,
            last_name=telegram_data.last_name,
            username=telegram_data.username,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    updated = False
    for field in ("first_name", "last_name", "username"):
        value = getattr(telegram_data, field)
        if value and getattr(user, field) != value:
            setattr(user, field, value)
            updated = True

    if updated:
        db.commit()
        db.refresh(user)

    return user


@router.post("/auth/callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    telegram_data = await _parse_telegram_auth(request)
    payload = telegram_data.dict()
    if not validate_telegram_auth(payload.copy()):
        raise HTTPException(status_code=403, detail="Invalid Telegram data")

    user = _sync_telegram_user(db, telegram_data)
    token = create_jwt(user.id, user.is_admin)
    refresh_token = create_refresh_jwt(user.id)
    return JSONResponse(
        {
            "status": "ok",
            "token": token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "auth_date": telegram_data.auth_date,
                "hash": telegram_data.hash,
                "photo_url": telegram_data.photo_url,
            },
        }
    )


@router.post("/", response_model=UserSchema)
def create_or_update_user(payload: UserCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    user = db.query(User).filter(User.telegram_id == payload.telegram_id).first()
    if not user:
        user = User(**data)
        db.add(user)
    else:
        for field, value in data.items():
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.post("/telegram/login")
def telegram_login(payload: TelegramAuth, db: Session = Depends(get_db)):
    data = payload.dict()
    if not validate_telegram_auth(data.copy()):
        raise HTTPException(status_code=403, detail="Invalid Telegram hash")

    user = _sync_telegram_user(db, payload)
    token = create_jwt(user.id, user.is_admin)
    refresh_token = create_refresh_jwt(user.id)
    return {"token": token, "refresh_token": refresh_token}


@router.post("/login_by_id")
def login_by_id(payload: LoginById, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == payload.telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_jwt(user.id, user.is_admin)
    refresh_token = create_refresh_jwt(user.id)
    return JSONResponse(
        {
            "status": "ok",
            "token": token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "auth_date": int(time()),
            },
        }
    )


@router.post("/refresh")
def refresh_token(payload: RefreshTokenPayload, db: Session = Depends(get_db)):
    try:
        data = decode_refresh_jwt(payload.refresh_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = data.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_jwt(user.id, user.is_admin)
    refresh_token = create_refresh_jwt(user.id)
    return {"status": "ok", "token": token, "refresh_token": refresh_token}


@router.get("/{telegram_id}", response_model=UserSchema)
def get_user(telegram_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
