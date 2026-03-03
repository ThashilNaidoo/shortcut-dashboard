from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    shortcut_api_token: str
    gemini_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()
