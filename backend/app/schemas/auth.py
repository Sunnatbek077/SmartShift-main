from typing import Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    full_name: str
    username: str
    role: str
    class_name: Optional[str] = None
    teacher_id: Optional[str] = None
    is_active: bool = True


class LoginResponse(BaseModel):
    token: str
    user: UserOut


class RoleLoginRequest(BaseModel):
    password: str


class RoleLoginResponse(BaseModel):
    token: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
