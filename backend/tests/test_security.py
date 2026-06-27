import hashlib

from app.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_legacy_password,
    verify_password,
)


def test_legacy_password_verifies_against_frontend_scheme():
    legacy_hash = hashlib.sha256(("secret123" + settings.legacy_password_salt).encode()).hexdigest()
    assert verify_legacy_password("secret123", legacy_hash)
    assert not verify_legacy_password("wrong", legacy_hash)


def test_bcrypt_hash_round_trip():
    h = hash_password("secret123")
    assert verify_password("secret123", h, "bcrypt")
    assert not verify_password("wrong", h, "bcrypt")


def test_verify_password_dispatches_by_algo():
    legacy_hash = hashlib.sha256(("secret123" + settings.legacy_password_salt).encode()).hexdigest()
    assert verify_password("secret123", legacy_hash, "sha256_legacy")


def test_jwt_round_trip():
    token = create_access_token(subject="user-1", role="student")
    payload = decode_access_token(token)
    assert payload["sub"] == "user-1"
    assert payload["role"] == "student"
