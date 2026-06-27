from fastapi import APIRouter, Depends

from app.config import settings
from app.core.deps import require_role
from app.schemas.auth import ChangePasswordRequest, RoleLoginRequest, RoleLoginResponse
from app.schemas.ministry import MinistryReportOut
from app.services import credentials_service, ministry_service
from app.services.auth_service import issue_role_token

router = APIRouter(prefix="/ministry", tags=["ministry"])


@router.post("/login", response_model=RoleLoginResponse)
def ministry_login(payload: RoleLoginRequest):
    credentials_service.login("ministry", payload.password, settings.default_ministry_password)
    return RoleLoginResponse(token=issue_role_token("ministry"))


@router.patch("/password", dependencies=[Depends(require_role("ministry"))])
def change_ministry_password(payload: ChangePasswordRequest):
    credentials_service.change_password(
        "ministry", payload.old_password, payload.new_password, settings.default_ministry_password
    )
    return {"ok": True}


@router.get("/report", response_model=MinistryReportOut, dependencies=[Depends(require_role("ministry"))])
def ministry_report():
    return ministry_service.get_ministry_report()
