"""Increase length of columns in users table

Revision ID: 74d1b31bcf73
Revises: d05825af0c06
Create Date: 2024-08-05 21:08:08.135523

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '74d1b31bcf73'
down_revision = 'd05825af0c06'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('followers', schema=None) as batch_op:
        batch_op.create_unique_constraint('uix_follower_followed', ['follower_id', 'followed_id'])

    with op.batch_alter_table('user_favourites', schema=None) as batch_op:
        batch_op.create_unique_constraint('uix_user_post', ['user_id', 'post_id'])

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('username',
               existing_type=sa.VARCHAR(length=80),
               type_=sa.String(length=255),
               existing_nullable=False)
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=120),
               type_=sa.String(length=255),
               existing_nullable=False)
        batch_op.alter_column('profile_pic',
               existing_type=sa.VARCHAR(length=256),
               type_=sa.String(length=255),
               existing_nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('profile_pic',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(length=256),
               existing_nullable=True)
        batch_op.alter_column('email',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(length=120),
               existing_nullable=False)
        batch_op.alter_column('username',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(length=80),
               existing_nullable=False)

    with op.batch_alter_table('user_favourites', schema=None) as batch_op:
        batch_op.drop_constraint('uix_user_post', type_='unique')

    with op.batch_alter_table('followers', schema=None) as batch_op:
        batch_op.drop_constraint('uix_follower_followed', type_='unique')

    # ### end Alembic commands ###
