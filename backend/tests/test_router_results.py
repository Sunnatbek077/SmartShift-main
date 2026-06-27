import hashlib

from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def _legacy_hash(password: str) -> str:
    return hashlib.sha256((password + settings.legacy_password_salt).encode()).hexdigest()


def _login_student(fake_db):
    fake_db.seed(
        "users",
        [
            {
                "id": "s1",
                "full_name": "Bekzod",
                "username": "bekzod",
                "password_hash": _legacy_hash("mypass"),
                "password_algo": "sha256_legacy",
                "role": "student",
                "is_active": True,
            }
        ],
    )
    resp = client.post("/auth/login", json={"username": "bekzod", "password": "mypass"})
    return resp.json()["token"]


def test_save_and_fetch_own_results(fake_db):
    token = _login_student(fake_db)
    headers = {"Authorization": f"Bearer {token}"}

    save = client.post("/results", json={"score": 90, "topic_name": "Algebra"}, headers=headers)
    assert save.status_code == 200

    mine = client.get("/results/me", headers=headers)
    assert mine.status_code == 200
    assert mine.json()[0]["score"] == 90


def test_cannot_fetch_results_without_token():
    resp = client.get("/results/me")
    assert resp.status_code == 401
