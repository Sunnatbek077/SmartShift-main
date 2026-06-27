import pytest
from fastapi import HTTPException

from app.services import user_service


def test_teacher_cannot_modify_another_teachers_student(fake_db):
    fake_db.seed(
        "users",
        [{"id": "s1", "username": "s1", "role": "student", "teacher_id": "teacher-A"}],
    )
    with pytest.raises(HTTPException) as exc:
        user_service.toggle_student_active("s1", "teacher-B", False)
    assert exc.value.status_code == 404


def test_add_student_rejects_duplicate_username(fake_db):
    fake_db.seed("users", [{"id": "s1", "username": "bekzod", "role": "student"}])
    with pytest.raises(HTTPException) as exc:
        user_service.add_student(
            full_name="B", username="bekzod", password="x", class_name="9A", teacher_id="t1"
        )
    assert exc.value.status_code == 409


def test_get_teacher_stats_computes_average(fake_db):
    fake_db.seed(
        "users",
        [
            {"id": "s1", "role": "student", "teacher_id": "t1"},
            {"id": "s2", "role": "student", "teacher_id": "t1"},
        ],
    )
    fake_db.seed(
        "results",
        [
            {"id": "r1", "student_id": "s1", "score": 80},
            {"id": "r2", "student_id": "s2", "score": 60},
        ],
    )
    stats = user_service.get_teacher_stats("t1")
    assert stats == {"student_count": 2, "result_count": 2, "avg_score": 70}
