import os

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("JWT_SECRET", "test-secret")

import pytest

from app.core import deps
from app.services import (
    auth_service,
    biometrics_service,
    credentials_service,
    regions_service,
    results_service,
    storage_service,
    user_service,
)
from tests.fake_supabase import FakeSupabase

# Every module below did `from app.db.client import get_supabase`, binding its
# own local reference -- patching app.db.client.get_supabase alone wouldn't
# reach these already-bound names, so each is patched individually.
_MODULES_USING_SUPABASE = [
    deps,
    auth_service,
    biometrics_service,
    credentials_service,
    regions_service,
    results_service,
    storage_service,
    user_service,
]


@pytest.fixture
def fake_db(monkeypatch):
    fake = FakeSupabase()
    for module in _MODULES_USING_SUPABASE:
        monkeypatch.setattr(module, "get_supabase", lambda: fake)
    return fake
