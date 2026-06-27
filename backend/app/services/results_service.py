import json as _json
from datetime import datetime, timezone

from app.db.client import get_supabase


def save_result(*, student_id: str, topic_id, topic_name, fan_id, fan_name, score, transcript, details) -> None:
    sb = get_supabase()

    sb.table("results").insert(
        {
            "student_id": student_id,
            "topic_id": topic_id,
            "topic_name": topic_name,
            "fan_id": fan_id,
            "fan_name": fan_name,
            "score": score,
            "transcript": (transcript or "")[:1000],
            "details": _json.dumps(details) if details else None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()


def get_student_results(student_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("results")
        .select("*")
        .eq("student_id", student_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def get_all_student_results(teacher_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("results")
        .select("*,users!inner(full_name,username,class_name,teacher_id)")
        .eq("users.teacher_id", teacher_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []
