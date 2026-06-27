from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.schemas.regions import RegionCreate, RegionOut, SetTeacherRegionRequest
from app.services import regions_service

router = APIRouter(tags=["regions"])


@router.get("/regions", response_model=list[RegionOut])
def list_regions():
    return regions_service.get_all_regions()


@router.post("/regions", response_model=RegionOut, dependencies=[Depends(require_role("admin"))])
def create_region(payload: RegionCreate):
    return regions_service.create_region(payload.name)


@router.delete("/regions/{region_id}", dependencies=[Depends(require_role("admin"))])
def delete_region(region_id: str):
    regions_service.delete_region(region_id)
    return {"ok": True}


@router.put("/teachers/{teacher_id}/region", dependencies=[Depends(require_role("admin"))])
def set_teacher_region(teacher_id: str, payload: SetTeacherRegionRequest):
    regions_service.set_teacher_region(teacher_id, payload.region_id)
    return {"ok": True}


@router.get("/teachers/regions", dependencies=[Depends(require_role("admin"))])
def teacher_regions_map():
    return regions_service.get_teacher_regions_map()
