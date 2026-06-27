from pydantic import BaseModel


class TeacherStatsOut(BaseModel):
    student_count: int
    result_count: int
    avg_score: int
