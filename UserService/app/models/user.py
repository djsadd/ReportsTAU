from sqlalchemy import Column, Integer, BigInteger, String, Boolean
from app.core.db import Base


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
	first_name = Column(String, nullable=True)
	last_name = Column(String, nullable=True)
	username = Column(String, nullable=True)
	fio = Column(String, nullable=True)
	position = Column(String, nullable=True)
	department = Column(String, nullable=True)
	phone = Column(String, nullable=True)
	is_admin = Column(Boolean, default=False, nullable=False)
