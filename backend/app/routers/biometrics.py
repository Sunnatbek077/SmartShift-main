from fastapi import APIRouter, Depends, Query

from app.core.deps import require_role
from app.services import biometrics_service

router = APIRouter(prefix="/biometrics", tags=["biometrics"])


@router.get("", dependencies=[Depends(require_role("teacher"))])
def get_biometrics(student_ids: list[str] = Query(default=[])):
    return biometrics_service.get_students_biometrics(student_ids)


@router.delete("/{student_id}", dependencies=[Depends(require_role("teacher"))])
def reset_biometrics(student_id: str):
    biometrics_service.reset_student_biometrics(student_id)
    return {"ok": True}
