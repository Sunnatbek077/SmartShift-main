from typing import Optional

from pydantic import BaseModel

from app.schemas.auth import UserOut


class AddStudentRequest(BaseModel):
    full_name: str
    username: str
    password: str
    class_name: str


class CreateTeacherRequest(BaseModel):
    full_name: str
    username: str
    password: str
    region_id: Optional[str] = None


class SetActiveRequest(BaseModel):
    is_active: bool


class SetPasswordRequest(BaseModel):
    new_password: str


class StudentsResponse(BaseModel):
    students: list[UserOut]


class UpdateTeacherProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    school: Optional[str] = None
    subject: Optional[str] = None
    experience: Optional[str] = None
    about: Optional[str] = None
    new_password: Optional[str] = None
