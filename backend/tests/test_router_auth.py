import hashlib

from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def _legacy_hash(password: str) -> str:
    return hashlib.sha256((password + settings.legacy_password_salt).encode()).hexdigest()


def test_login_success_returns_token(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "u1",
                "full_name": "Bekzod Toshmatov",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": True,
            }
        ],
    )
    resp = client.post("/auth/login", json={"username": "bekzod", "password": "mypass"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["username"] == "bekzod"
    assert body["token"]


def test_login_wrong_password_returns_401(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "u1",
                "full_name": "Bekzod",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": True,
            }
        ],
    )
    resp = client.post("/auth/login", json={"username": "bekzod", "password": "wrong"})
    assert resp.status_code == 401


def test_teacher_endpoint_requires_token():
    resp = client.get("/teacher/students")
    assert resp.status_code == 401


def test_teacher_cannot_access_admin_endpoint(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "t1",
                "full_name": "Aziz",
                "username": "aziz",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "teacher",
                "is_active": True,
            }
        ],
    )
    login = client.post("/auth/login", json={"username": "aziz", "password": "mypass"})
    token = login.json()["token"]
    resp = client.get("/admin/teachers", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
