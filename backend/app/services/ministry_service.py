from app.services.user_service import get_all_teachers, get_teacher_stats


def get_ministry_report() -> dict:
    teachers = get_all_teachers()
    teacher_reports = []
    for t in teachers:
        stats = get_teacher_stats(t["id"])
        teacher_reports.append(
            {
                "id": t["id"],
                "full_name": t["full_name"],
                "username": t["username"],
                "is_active": t.get("is_active", True),
                "student_count": stats["student_count"],
                "result_count": stats["result_count"],
                "avg_score": stats["avg_score"],
            }
        )

    total_students = sum(t["student_count"] for t in teacher_reports)
    total_results = sum(t["result_count"] for t in teacher_reports)
    scored = [t for t in teacher_reports if t["result_count"] > 0]
    overall_avg = (
        round(sum(t["avg_score"] * t["result_count"] for t in scored) / total_results)
        if total_results and scored
        else 0
    )
    at_risk = sum(1 for t in scored if t["avg_score"] < 60)

    return {
        "total_teachers": len(teachers),
        "total_students": total_students,
        "total_results": total_results,
        "overall_avg_score": overall_avg,
        "at_risk_teachers": at_risk,
        "teacher_reports": teacher_reports,
    }
