from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    app_name: str = "Land Record AI"
    database_url: str = "postgresql://localhost/land_records"
    secret_key: str = "replace-this-with-a-long-random-secret"
    access_token_expire_minutes: int = 480
    upload_dir: str = "./uploads"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    confidence_review_threshold: float = 75.0
    max_upload_mb: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def upload_path(self):
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

settings = Settings()
