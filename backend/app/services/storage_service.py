from typing import Optional

from app.db.client import get_supabase

GLOBAL_ID = "eduai_global_content"

_GLOBAL_PREFIXES = (
    "lecture_",
    "video_",
    "lab_html_",
    "lab_",
    "quiz_",
    "practice_",
    "homework_",
    "custom_subjects_",
    "custom_topics_",
    "slides_",
)


def is_global_key(key: str) -> bool:
    return key.startswith(_GLOBAL_PREFIXES)


def _target_user_id(key: str, requester_user_id: str) -> str:
    return GLOBAL_ID if is_global_key(key) else requester_user_id


def get_value(key: str, requester_user_id: str) -> Optional[str]:
    sb = get_supabase()
    target = _target_user_id(key, requester_user_id)
    result = (
        sb.table("eduai_data")
        .select("value")
        .eq("user_id", target)
        .eq("key", key)
        .maybe_single()
        .execute()
    )
    return result.data["value"] if result.data else None


def set_value(key: str, value: str, requester_user_id: str) -> None:
    sb = get_supabase()
    target = _target_user_id(key, requester_user_id)
    sb.table("eduai_data").upsert(
        {"user_id": target, "key": key, "value": value},
        on_conflict="user_id,key",
    ).execute()


def remove_value(key: str, requester_user_id: str) -> None:
    sb = get_supabase()
    target = _target_user_id(key, requester_user_id)
    sb.table("eduai_data").delete().eq("user_id", target).eq("key", key).execute()


def sync_from_cloud(requester_user_id: str) -> list[dict]:
    sb = get_supabase()
    personal = sb.table("eduai_data").select("key,value").eq("user_id", requester_user_id).execute()
    glob = sb.table("eduai_data").select("key,value").eq("user_id", GLOBAL_ID).execute()
    return (personal.data or []) + (glob.data or [])


def sync_to_cloud(rows: list[dict], requester_user_id: str) -> None:
    if not rows:
        return
    sb = get_supabase()
    payload = [
        {
            "user_id": _target_user_id(r["key"], requester_user_id),
            "key": r["key"],
            "value": r["value"],
        }
        for r in rows
    ]
    chunk_size = 50
    for i in range(0, len(payload), chunk_size):
        sb.table("eduai_data").upsert(payload[i : i + chunk_size], on_conflict="user_id,key").execute()
