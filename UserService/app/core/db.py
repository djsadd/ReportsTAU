from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings


# SQLAlchemy base and engine
Base = declarative_base()


# Expect a synchronous driver in DATABASE_URL, e.g. postgresql+psycopg2 or sqlite
engine = create_engine(
	settings.DATABASE_URL if settings.DATABASE_URL else "sqlite:///./user_service.db",
	pool_pre_ping=True,
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
