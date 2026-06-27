from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.db.client import get_supabase

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: Optional[str], role: str, row: Optional[dict] = None):
        self.user_id = user_id
        self.role = role
        self.row = row or {}


def _unauthorized(detail: str = "Avtorizatsiya talab qilinadi") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> CurrentUser:
    if creds is None:
        raise _unauthorized()
    try:
        payload = decode_access_token(creds.credentials)
    except jwt.PyJWTError:
        raise _unauthorized("Token yaroqsiz yoki muddati o'tgan")

    role = payload.get("role")
    user_id = payload.get("sub")

    if role in ("admin", "ministry"):
        return CurrentUser(user_id=None, role=role)

    if not user_id:
        raise _unauthorized()

    sb = get_supabase()
    result = sb.table("users").select("*").eq("id", user_id).execute()
    rows = result.data if result else []
    row = rows[0] if rows else None
    if not row:
        raise _unauthorized("Foydalanuvchi topilmadi")
    if not row.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akkaunt bloklangan")

    return CurrentUser(user_id=user_id, role=row.get("role", role), row=row)


def require_role(*roles: str):
    async def _checker(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
        return current

    return _checker
