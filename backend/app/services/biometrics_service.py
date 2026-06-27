from app.db.client import get_supabase


def get_students_biometrics(student_ids: list[str]) -> list[dict]:
    if not student_ids:
        return []
    sb = get_supabase()
    result = sb.table("biometric_profiles").select("user_id,profile").in_("user_id", student_ids).execute()
    return result.data or []


def reset_student_biometrics(student_id: str) -> None:
    sb = get_supabase()
    sb.table("biometric_profiles").delete().eq("user_id", student_id).execute()
