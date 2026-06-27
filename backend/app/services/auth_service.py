from typing import Optional

from fastapi import HTTPException, status

from app.core.security import (
    BCRYPT_ALGO,
    LEGACY_ALGO,
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.client import get_supabase


def authenticate(username: str, password: str) -> dict:
    """Validates credentials and lazily migrates legacy SHA-256 hashes to bcrypt.

    Existing rows created by the old frontend have password_algo='sha256_legacy'.
    On a successful legacy match we immediately re-hash with bcrypt so the
    migration is transparent and doesn't force a password reset.
    """
    sb = get_supabase()
    username = username.strip().lower()
    result = sb.table("users").select("*").eq("username", username).maybe_single().execute()
    user = result.data
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login yoki parol noto'g'ri")

    algo = user.get("password_algo") or LEGACY_ALGO
    if not verify_password(password, user["password_hash"], algo):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login yoki parol noto'g'ri")

    if not user.get("is_active", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Akkaunt bloklangan. O'qituvchiga murojaat qiling.")

    if algo == LEGACY_ALGO:
        new_hash = hash_password(password)
        sb.table("users").update(
            {"password_hash": new_hash, "password_algo": BCRYPT_ALGO}
        ).eq("id", user["id"]).execute()
        user["password_hash"] = new_hash
        user["password_algo"] = BCRYPT_ALGO

    return user


def issue_user_token(user: dict) -> str:
    return create_access_token(subject=user["id"], role=user["role"])


def issue_role_token(role: str) -> str:
    return create_access_token(subject=None, role=role)


def create_teacher(*, full_name: str, username: str, password: str, region_id: Optional[str] = None) -> dict:
    sb = get_supabase()
    username = username.strip().lower()
    existing = sb.table("users").select("id").eq("username", username).execute()
    if existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu username allaqachon mavjud")

    row = {
        "full_name": full_name.strip(),
        "username": username,
        "password_hash": hash_password(password),
        "password_algo": BCRYPT_ALGO,
        "role": "teacher",
        "is_active": True,
        "region_id": region_id,
    }
    result = sb.table("users").insert(row).execute()
    return result.data[0]
