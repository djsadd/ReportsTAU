"""init worklog

Revision ID: 4b958448c9d5
Revises: 
Create Date: 2025-12-11 10:59:49.336717

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b958448c9d5'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Таблица worklogs уже существует (создана ранее через SQLAlchemy create_all),
    # поэтому начальная миграция только помечается применённой без изменений схемы.
    pass


def downgrade() -> None:
    # При откате ничего не делаем, чтобы не трогать существующие данные.
    pass
