from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


Base = declarative_base()


engine = create_engine(
    settings.DATABASE_URL if settings.DATABASE_URL else "sqlite:///./worklog_service.db",
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Автосоздание таблиц WorkLog при старте сервиса
def init_db() -> None:
    import app.models.work_log  # noqa: F401

    Base.metadata.create_all(bind=engine)


init_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
