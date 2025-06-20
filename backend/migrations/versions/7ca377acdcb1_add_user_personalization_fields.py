"""Add user personalization fields

Revision ID: 7ca377acdcb1
Revises: 
Create Date: 2025-05-02 16:50:46.279567

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7ca377acdcb1'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Пользователи', schema=None) as batch_op:
        batch_op.add_column(sa.Column('Аватар', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('О_себе', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('Телефон', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('ДатаРождения', sa.Date(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Пользователи', schema=None) as batch_op:
        batch_op.drop_column('ДатаРождения')
        batch_op.drop_column('Телефон')
        batch_op.drop_column('О_себе')
        batch_op.drop_column('Аватар')

    # ### end Alembic commands ###
