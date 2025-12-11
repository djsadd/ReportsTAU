from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Integer, String, Text, func, text

from app.core.db import Base


class WorkLog(Base):
    __tablename__ = "worklogs"

    id = Column(Integer, primary_key=True, index=True)
    # user_id ссылается логически на users.id в другом сервисе,
    # но в этой БД храним просто Integer без внешнего ключа.
    user_id = Column(Integer, nullable=False, index=True)
    description = Column(Text, nullable=False)
    llm_Description = Column(Text, nullable=True)
    project = Column(Text, nullable=True)
    date = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    status = Column(String, nullable=False, server_default=text("'done'"))
