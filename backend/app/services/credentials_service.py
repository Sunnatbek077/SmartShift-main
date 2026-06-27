from typing import Optional

from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password
from app.db.client import get_supabase

LEGACY_ALGO = "sha256_legacy"
BCRYPT_ALGO = "bcrypt"


def _get_row(role: str) -> Optional[dict]:
    sb = get_supabase()
    result = sb.table("app_credentials").select("*").eq("role", role).execute()
    rows = result.data if result else []
    return rows[0] if rows else None


def login(role: str, password: str, default_password: str) -> None:
    """Shared admin/ministry login: falls back to a seeded default password
    the first time, then requires whatever was last set via change_password().
    """
    row = _get_row(role)
    if not row:
        if password != default_password:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Parol noto'g'ri")
        return

    if not verify_password(password, row["password_hash"], row.get("password_algo", BCRYPT_ALGO)):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Parol noto'g'ri")


def change_password(role: str, old_password: str, new_password: str, default_password: str) -> None:
    row = _get_row(role)
    if not row:
        if old_password != default_password:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Eski parol noto'g'ri")
    else:
        if not verify_password(old_password, row["password_hash"], row.get("password_algo", BCRYPT_ALGO)):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Eski parol noto'g'ri")

    sb = get_supabase()
    new_hash = hash_password(new_password)
    sb.table("app_credentials").upsert(
        {"role": role, "password_hash": new_hash, "password_algo": BCRYPT_ALGO}
    ).execute()


def reset_password(role: str) -> None:
    sb = get_supabase()
    sb.table("app_credentials").delete().eq("role", role).execute()
