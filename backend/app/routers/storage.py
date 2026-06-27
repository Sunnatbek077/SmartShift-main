from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_current_user
from app.schemas.storage import StorageBulkRow, StorageValue
from app.services import storage_service

router = APIRouter(prefix="/storage", tags=["storage"])


def _requester_id(current: CurrentUser) -> str:
    # Mirrors the frontend's free-form getUserId() -- per-user keys are scoped
    # to whatever identity the JWT carries (student/teacher row id).
    return current.user_id or "default"


@router.get("/{key}", response_model=StorageValue)
def get_value(key: str, current: CurrentUser = Depends(get_current_user)):
    return StorageValue(value=storage_service.get_value(key, _requester_id(current)))


@router.put("/{key}")
def set_value(key: str, payload: StorageValue, current: CurrentUser = Depends(get_current_user)):
    storage_service.set_value(key, payload.value or "", _requester_id(current))
    return {"ok": True}


@router.delete("/{key}")
def remove_value(key: str, current: CurrentUser = Depends(get_current_user)):
    storage_service.remove_value(key, _requester_id(current))
    return {"ok": True}


@router.get("/_sync/from-cloud", response_model=list[StorageBulkRow])
def sync_from_cloud(current: CurrentUser = Depends(get_current_user)):
    return storage_service.sync_from_cloud(_requester_id(current))


@router.post("/_sync/to-cloud")
def sync_to_cloud(rows: list[StorageBulkRow], current: CurrentUser = Depends(get_current_user)):
    storage_service.sync_to_cloud([r.model_dump() for r in rows], _requester_id(current))
    return {"ok": True}
