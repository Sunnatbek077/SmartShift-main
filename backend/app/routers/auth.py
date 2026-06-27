from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_current_user
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.services.auth_service import authenticate, issue_user_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = authenticate(payload.username, payload.password)
    token = issue_user_token(user)
    return LoginResponse(token=token, user=UserOut(**user))


@router.post("/logout")
def logout():
    # Stateless JWT -- the frontend just discards the token. Kept as an
    # endpoint for symmetry with the old auth.js API and future blacklisting.
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(current: CurrentUser = Depends(get_current_user)):
    return UserOut(**current.row)
