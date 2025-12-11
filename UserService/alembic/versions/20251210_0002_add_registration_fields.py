"""add registration fields to users table

Revision ID: 20251210_0002
Revises: 20251210_0001
Create Date: 2025-12-10
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251210_0002'
down_revision = '20251210_0001'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('fio', sa.String(), nullable=True))
    op.add_column('users', sa.Column('position', sa.String(), nullable=True))
    op.add_column('users', sa.Column('department', sa.String(), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))


def downgrade():
    op.drop_column('users', 'phone')
    op.drop_column('users', 'department')
    op.drop_column('users', 'position')
    op.drop_column('users', 'fio')
