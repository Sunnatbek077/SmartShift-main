from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    jwt_secret: str
    jwt_expire_days: int = 7
    cors_origins: str = "http://localhost:5173"
    legacy_password_salt: str = "eduai_salt_2024"
    default_admin_password: str = "123"
    default_ministry_password: str = "456"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
