from pydantic import BaseModel


class RegionCreate(BaseModel):
    name: str


class RegionOut(BaseModel):
    id: str
    name: str


class SetTeacherRegionRequest(BaseModel):
    region_id: str
