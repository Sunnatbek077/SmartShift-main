import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

LEGACY_ALGO = "sha256_legacy"
BCRYPT_ALGO = "bcrypt"


def hash_password(password: str) -> str:
    """Hash a new/changed password. Always bcrypt going forward."""
    return pwd_context.hash(password)


def verify_legacy_password(password: str, stored_hash: str) -> bool:
    """Replicates the frontend's old SHA-256(password + static salt) scheme.

    Needed so existing rows created before this migration keep working without
    a forced reset -- see auth_service.authenticate() for the lazy re-hash step.
    """
    digest = hashlib.sha256((password + settings.legacy_password_salt).encode()).hexdigest()
    return digest == stored_hash


def verify_password(password: str, stored_hash: str, algo: str) -> bool:
    if algo == LEGACY_ALGO:
        return verify_legacy_password(password, stored_hash)
    return pwd_context.verify(password, stored_hash)


def create_access_token(*, subject: Optional[str], role: str, extra: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_expire_days),
        **(extra or {}),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
