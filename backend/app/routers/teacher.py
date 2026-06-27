from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_role
from app.schemas.auth import UserOut
from app.schemas.results import ResultOut
from app.schemas.teacher import (
    AddStudentRequest,
    CreateTeacherRequest,
    SetActiveRequest,
    SetPasswordRequest,
    UpdateTeacherProfileRequest,
)
from app.services import results_service, user_service
from app.services.auth_service import create_teacher

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.post("", response_model=UserOut)
def create_teacher_endpoint(payload: CreateTeacherRequest):
    teacher = create_teacher(
        full_name=payload.full_name,
        username=payload.username,
        password=payload.password,
        region_id=payload.region_id,
    )
    return UserOut(**teacher)


@router.post("/students", response_model=UserOut)
def add_student(payload: AddStudentRequest, current: CurrentUser = Depends(require_role("teacher"))):
    student = user_service.add_student(
        full_name=payload.full_name,
        username=payload.username,
        password=payload.password,
        class_name=payload.class_name,
        teacher_id=current.user_id,
    )
    return UserOut(**student)


@router.patch("/me")
def update_my_profile(payload: UpdateTeacherProfileRequest, current: CurrentUser = Depends(require_role("teacher"))):
    fields = payload.model_dump(exclude={"new_password"}, exclude_none=True)
    if payload.new_password:
        user_service.change_own_password(current.user_id, payload.new_password)
    return user_service.update_teacher_profile(current.user_id, fields)


@router.get("/students", response_model=list[UserOut])
def list_students(current: CurrentUser = Depends(require_role("teacher"))):
    return [UserOut(**s) for s in user_service.get_students(current.user_id)]


@router.patch("/students/{student_id}/active")
def set_student_active(
    student_id: str, payload: SetActiveRequest, current: CurrentUser = Depends(require_role("teacher"))
):
    user_service.toggle_student_active(student_id, current.user_id, payload.is_active)
    return {"ok": True}


@router.delete("/students/{student_id}")
def remove_student(student_id: str, current: CurrentUser = Depends(require_role("teacher"))):
    user_service.delete_student(student_id, current.user_id)
    return {"ok": True}


@router.patch("/students/{student_id}/password")
def set_student_password(
    student_id: str, payload: SetPasswordRequest, current: CurrentUser = Depends(require_role("teacher"))
):
    user_service.change_student_password(student_id, current.user_id, payload.new_password)
    return {"ok": True}


@router.get("/students/{student_id}/results", response_model=list[ResultOut])
def student_results(student_id: str, current: CurrentUser = Depends(require_role("teacher"))):
    user_service.assert_student_belongs_to_teacher(student_id, current.user_id)
    return results_service.get_student_results(student_id)


@router.get("/results")
def all_results(current: CurrentUser = Depends(require_role("teacher"))):
    return results_service.get_all_student_results(current.user_id)
