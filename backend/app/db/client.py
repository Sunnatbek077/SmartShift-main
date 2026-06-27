from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache
def get_supabase() -> Client:
    """Server-only Supabase client, built with the service-role key.

    Never construct a client with the anon key here -- the whole point of this
    backend is that the anon key no longer needs to exist in the frontend bundle.
    """
    return create_client(settings.supabase_url, settings.supabase_service_key)
