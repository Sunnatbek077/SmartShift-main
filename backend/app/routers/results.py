from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_role
from app.schemas.results import ResultOut, SaveResultRequest
from app.services import results_service

router = APIRouter(prefix="/results", tags=["results"])


@router.get("/me", response_model=list[ResultOut])
def my_results(current: CurrentUser = Depends(require_role("student"))):
    return results_service.get_student_results(current.user_id)


@router.post("")
def save_result(payload: SaveResultRequest, current: CurrentUser = Depends(require_role("student"))):
    results_service.save_result(
        student_id=current.user_id,
        topic_id=payload.topic_id,
        topic_name=payload.topic_name,
        fan_id=payload.fan_id,
        fan_name=payload.fan_name,
        score=payload.score,
        transcript=payload.transcript,
        details=payload.details,
    )
    return {"ok": True}
