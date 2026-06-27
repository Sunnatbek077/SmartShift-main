import pytest
from fastapi import HTTPException

from app.services import credentials_service


def test_login_falls_back_to_default_password(fake_db):
    credentials_service.login("admin", "123", "123")  # no row seeded yet


def test_login_rejects_wrong_default_password(fake_db):
    with pytest.raises(HTTPException):
        credentials_service.login("admin", "wrong", "123")


def test_change_password_then_login_with_new_password(fake_db):
    credentials_service.change_password("admin", "123", "newpass", "123")
    credentials_service.login("admin", "newpass", "123")
    with pytest.raises(HTTPException):
        credentials_service.login("admin", "123", "123")


def test_reset_password_restores_default(fake_db):
    credentials_service.change_password("admin", "123", "newpass", "123")
    credentials_service.reset_password("admin")
    credentials_service.login("admin", "123", "123")
