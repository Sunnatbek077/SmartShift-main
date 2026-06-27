from typing import Optional

from pydantic import BaseModel


class SaveResultRequest(BaseModel):
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    fan_id: Optional[str] = None
    fan_name: Optional[str] = None
    score: int
    transcript: Optional[str] = None
    details: Optional[dict] = None


class ResultOut(BaseModel):
    id: str
    student_id: str
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    fan_id: Optional[str] = None
    fan_name: Optional[str] = None
    score: int
    created_at: str
