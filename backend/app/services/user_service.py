from fastapi import HTTPException, status

from app.core.security import BCRYPT_ALGO, hash_password
from app.db.client import get_supabase


def add_student(*, full_name: str, username: str, password: str, class_name: str, teacher_id: str) -> dict:
    sb = get_supabase()
    username = username.strip().lower()
    existing = sb.table("users").select("id").eq("username", username).execute()
    if existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu username allaqachon mavjud")

    row = {
        "full_name": full_name.strip(),
        "username": username,
        "password_hash": hash_password(password),
        "password_algo": BCRYPT_ALGO,
        "role": "student",
        "class_name": class_name.strip(),
        "teacher_id": teacher_id,
        "is_active": True,
    }
    result = sb.table("users").insert(row).execute()
    return result.data[0]


def get_students(teacher_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("*")
        .eq("teacher_id", teacher_id)
        .eq("role", "student")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def assert_student_belongs_to_teacher(student_id: str, teacher_id: str) -> dict:
    return _student_belongs_to_teacher(get_supabase(), student_id, teacher_id)


def _student_belongs_to_teacher(sb, student_id: str, teacher_id: str) -> dict:
    result = sb.table("users").select("*").eq("id", student_id).maybe_single().execute()
    student = result.data
    if not student or student.get("teacher_id") != teacher_id or student.get("role") != "student":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Talaba topilmadi")
    return student


def toggle_student_active(student_id: str, teacher_id: str, is_active: bool) -> None:
    sb = get_supabase()
    _student_belongs_to_teacher(sb, student_id, teacher_id)
    sb.table("users").update({"is_active": is_active}).eq("id", student_id).execute()


def delete_student(student_id: str, teacher_id: str) -> None:
    sb = get_supabase()
    _student_belongs_to_teacher(sb, student_id, teacher_id)
    sb.table("users").delete().eq("id", student_id).execute()


def change_student_password(student_id: str, teacher_id: str, new_password: str) -> None:
    sb = get_supabase()
    _student_belongs_to_teacher(sb, student_id, teacher_id)
    sb.table("users").update(
        {"password_hash": hash_password(new_password), "password_algo": BCRYPT_ALGO}
    ).eq("id", student_id).execute()


def change_own_password(user_id: str, new_password: str) -> None:
    sb = get_supabase()
    sb.table("users").update(
        {"password_hash": hash_password(new_password), "password_algo": BCRYPT_ALGO}
    ).eq("id", user_id).execute()


def update_teacher_profile(teacher_id: str, fields: dict) -> dict:
    sb = get_supabase()
    clean = {k: v for k, v in fields.items() if v is not None}
    if not clean:
        result = sb.table("users").select("*").eq("id", teacher_id).maybe_single().execute()
        return result.data
    result = sb.table("users").update(clean).eq("id", teacher_id).execute()
    return result.data[0] if result.data else None


def get_all_teachers() -> list[dict]:
    sb = get_supabase()
    result = sb.table("users").select("*").eq("role", "teacher").order("created_at", desc=True).execute()
    return result.data or []


def admin_reset_teacher_password(teacher_id: str, new_password: str) -> None:
    sb = get_supabase()
    sb.table("users").update(
        {"password_hash": hash_password(new_password), "password_algo": BCRYPT_ALGO}
    ).eq("id", teacher_id).execute()


def toggle_teacher_active(teacher_id: str, is_active: bool) -> None:
    sb = get_supabase()
    sb.table("users").update({"is_active": is_active}).eq("id", teacher_id).execute()


def delete_teacher(teacher_id: str) -> None:
    sb = get_supabase()
    sb.table("users").delete().eq("teacher_id", teacher_id).eq("role", "student").execute()
    sb.table("users").delete().eq("id", teacher_id).execute()


def get_teacher_stats(teacher_id: str) -> dict:
    sb = get_supabase()
    students = sb.table("users").select("id").eq("teacher_id", teacher_id).eq("role", "student").execute()
    student_ids = [s["id"] for s in (students.data or [])]
    if not student_ids:
        return {"student_count": 0, "result_count": 0, "avg_score": 0}

    results = sb.table("results").select("score,student_id").in_("student_id", student_ids).execute()
    rows = results.data or []
    avg = round(sum(r["score"] for r in rows) / len(rows)) if rows else 0
    return {"student_count": len(student_ids), "result_count": len(rows), "avg_score": avg}
