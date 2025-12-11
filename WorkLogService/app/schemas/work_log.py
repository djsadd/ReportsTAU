from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WorkLog(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    description: str
    llm_Description: Optional[str] = None
    project: Optional[str] = None
    date: date
    created_at: datetime
    updated_at: datetime
    status: str


class WorkLogCreate(BaseModel):
    user_id: int
    description: str
    project: Optional[str] = None
    # Дата в формате ISO (YYYY-MM-DD), если не указана
    date: Optional[str] = None
    status: Optional[str] = None


class PaginatedWorkLogs(BaseModel):
    items: list[WorkLog]
    total: int
    page: int
    page_size: int
