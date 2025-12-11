import os


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    # Зарезервировано на будущее, если понадобится JWT в этом сервисе
    JWT_SECRET = os.getenv("JWT_SECRET", "secret")
    JWT_ALG = "HS256"


settings = Settings()

