from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user_id
from app.models.work_log import WorkLog
from app.utils.llm import beautify_worklog_description
from app.schemas.work_log import PaginatedWorkLogs, WorkLog as WorkLogSchema, WorkLogCreate


router = APIRouter()


@router.post("", response_model=WorkLogSchema)
def create_worklog(payload: WorkLogCreate, db: Session = Depends(get_db)):
    data = payload.dict(exclude_unset=True)
    raw_date = data.get("date")
    if raw_date is not None:
        try:
            data["date"] = date.fromisoformat(raw_date)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid date format, expected YYYY-MM-DD")

    description = data.get("description")
    if description:
        data["llm_Description"] = beautify_worklog_description(description)
        print(data["llm_Description"])

    worklog = WorkLog(**data)
    db.add(worklog)
    db.commit()
    db.refresh(worklog)
    return worklog


@router.get("/my/resolved", response_model=PaginatedWorkLogs)
def list_my_resolved_worklogs(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Поиск по описанию и проекту"),
    project: Optional[str] = Query(None, description="Фильтр по проекту (точное совпадение)"),
    date_from: Optional[date] = Query(None, description="Начало диапазона даты (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Конец диапазона даты (YYYY-MM-DD)"),
):
    query = db.query(WorkLog).filter(WorkLog.user_id == user_id, WorkLog.status == "done")

    if project:
        query = query.filter(WorkLog.project == project)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                WorkLog.description.ilike(pattern),
                WorkLog.project.ilike(pattern),
            )
        )

    if date_from:
        query = query.filter(WorkLog.date >= date_from)

    if date_to:
        query = query.filter(WorkLog.date <= date_to)

    total = query.count()

    items = (
        query.order_by(WorkLog.date.desc(), WorkLog.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedWorkLogs(items=items, total=total, page=page, page_size=page_size)
