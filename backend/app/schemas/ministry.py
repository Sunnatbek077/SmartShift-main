from pydantic import BaseModel


class TeacherReportOut(BaseModel):
    id: str
    full_name: str
    username: str
    is_active: bool
    student_count: int
    result_count: int
    avg_score: int


class MinistryReportOut(BaseModel):
    total_teachers: int
    total_students: int
    total_results: int
    overall_avg_score: int
    at_risk_teachers: int
    teacher_reports: list[TeacherReportOut]
