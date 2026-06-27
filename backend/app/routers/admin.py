from fastapi import APIRouter, Depends

from app.config import settings
from app.core.deps import require_role
from app.schemas.admin import TeacherStatsOut
from app.schemas.auth import (
    ChangePasswordRequest,
    RoleLoginRequest,
    RoleLoginResponse,
    UserOut,
)
from app.schemas.teacher import SetActiveRequest, SetPasswordRequest
from app.services import credentials_service, user_service
from app.services.auth_service import issue_role_token

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=RoleLoginResponse)
def admin_login(payload: RoleLoginRequest):
    credentials_service.login("admin", payload.password, settings.default_admin_password)
    return RoleLoginResponse(token=issue_role_token("admin"))


@router.patch("/password", dependencies=[Depends(require_role("admin"))])
def change_admin_password(payload: ChangePasswordRequest):
    credentials_service.change_password(
        "admin", payload.old_password, payload.new_password, settings.default_admin_password
    )
    return {"ok": True}


@router.post("/password/reset", dependencies=[Depends(require_role("admin"))])
def reset_admin_password():
    credentials_service.reset_password("admin")
    return {"ok": True}


@router.get("/teachers", response_model=list[UserOut], dependencies=[Depends(require_role("admin"))])
def list_teachers():
    return user_service.get_all_teachers()


@router.patch("/teachers/{teacher_id}/password", dependencies=[Depends(require_role("admin"))])
def reset_teacher_password(teacher_id: str, payload: SetPasswordRequest):
    user_service.admin_reset_teacher_password(teacher_id, payload.new_password)
    return {"ok": True}


@router.patch("/teachers/{teacher_id}/active", dependencies=[Depends(require_role("admin"))])
def set_teacher_active(teacher_id: str, payload: SetActiveRequest):
    user_service.toggle_teacher_active(teacher_id, payload.is_active)
    return {"ok": True}


@router.delete("/teachers/{teacher_id}", dependencies=[Depends(require_role("admin"))])
def remove_teacher(teacher_id: str):
    user_service.delete_teacher(teacher_id)
    return {"ok": True}


@router.get(
    "/teachers/{teacher_id}/stats",
    response_model=TeacherStatsOut,
    dependencies=[Depends(require_role("admin"))],
)
def teacher_stats(teacher_id: str):
    return user_service.get_teacher_stats(teacher_id)
