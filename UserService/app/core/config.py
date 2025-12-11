import os


class Settings:
    JWT_SECRET = os.getenv("JWT_SECRET", "secret")
    JWT_ALG = "HS256"
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_API_BOT")
    DATABASE_URL = os.getenv("DATABASE_URL")


settings = Settings()