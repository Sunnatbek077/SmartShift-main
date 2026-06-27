import hashlib

import pytest
from fastapi import HTTPException

from app.config import settings
from app.services import auth_service


def _legacy_hash(password: str) -> str:
    return hashlib.sha256((password + settings.legacy_password_salt).encode()).hexdigest()


def test_authenticate_migrates_legacy_hash_on_success(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "u1",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": True,
            }
        ],
    )

    user = auth_service.authenticate("bekzod", "mypass")
    assert user["password_algo"] == "bcrypt"

    stored = fake_db.table("users").select("*").eq("username", "bekzod").maybe_single().execute().data
    assert stored["password_algo"] == "bcrypt"
    assert stored["password_hash"] != _legacy_hash("mypass")


def test_authenticate_rejects_wrong_password(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "u1",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": True,
            }
        ],
    )
    with pytest.raises(HTTPException) as exc:
        auth_service.authenticate("bekzod", "wrong")
    assert exc.value.status_code == 401


def test_authenticate_rejects_blocked_account(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "u1",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": False,
            }
        ],
    )
    with pytest.raises(HTTPException) as exc:
        auth_service.authenticate("bekzod", "mypass")
    assert exc.value.status_code == 403


def test_create_teacher_rejects_duplicate_username(fake_db):
    fake_db.seed("users", [{"id": "t1", "username": "aziz", "role": "teacher"}])
    with pytest.raises(HTTPException) as exc:
        auth_service.create_teacher(full_name="Aziz", username="aziz", password="x")
    assert exc.value.status_code == 409
