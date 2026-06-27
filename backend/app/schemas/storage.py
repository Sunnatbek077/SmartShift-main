from typing import Optional

from pydantic import BaseModel


class StorageValue(BaseModel):
    value: Optional[str] = None


class StorageBulkRow(BaseModel):
    key: str
    value: str
