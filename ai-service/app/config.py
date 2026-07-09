from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    llm_api_key: str = ""
    llm_base_url: str = "https://api.flatkey.ai/v1"
    llm_model: str = "gpt-4o-mini"
    groq_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    backend_url: str = "http://localhost:8080/api"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
