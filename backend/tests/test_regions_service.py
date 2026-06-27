import pytest
from fastapi import HTTPException

from app.services import regions_service


def test_create_and_list_regions(fake_db):
    region = regions_service.create_region("Toshkent")
    assert region["name"] == "Toshkent"
    assert [r["name"] for r in regions_service.get_all_regions()] == ["Toshkent"]


def test_create_region_rejects_duplicate_case_insensitive(fake_db):
    regions_service.create_region("Toshkent")
    with pytest.raises(HTTPException) as exc:
        regions_service.create_region("toshkent")
    assert exc.value.status_code == 409


def test_teacher_regions_map(fake_db):
    region = regions_service.create_region("Andijon")
    fake_db.seed("users", [{"id": "t1", "role": "teacher", "region_id": region["id"]}])
    mapping = regions_service.get_teacher_regions_map()
    assert mapping["t1"]["regionName"] == "Andijon"
