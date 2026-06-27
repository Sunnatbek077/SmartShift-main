from fastapi import HTTPException, status

from app.db.client import get_supabase


def get_all_regions() -> list[dict]:
    sb = get_supabase()
    result = sb.table("regions").select("*").order("name").execute()
    return result.data or []


def create_region(name: str) -> dict:
    name = name.strip()
    if not name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Hudud nomini kiriting")
    sb = get_supabase()
    existing = sb.table("regions").select("id").ilike("name", name).execute()
    if existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu hudud allaqachon mavjud")
    result = sb.table("regions").insert({"name": name}).execute()
    return result.data[0]


def delete_region(region_id: str) -> None:
    sb = get_supabase()
    sb.table("regions").delete().eq("id", region_id).execute()


def set_teacher_region(teacher_id: str, region_id: str) -> None:
    sb = get_supabase()
    sb.table("users").update({"region_id": region_id}).eq("id", teacher_id).eq("role", "teacher").execute()


def get_teacher_regions_map() -> dict:
    sb = get_supabase()
    teachers = sb.table("users").select("id,region_id").eq("role", "teacher").execute()
    regions = {r["id"]: r["name"] for r in get_all_regions()}
    return {
        t["id"]: {"regionId": t["region_id"], "regionName": regions.get(t["region_id"])}
        for t in (teachers.data or [])
        if t.get("region_id")
    }
