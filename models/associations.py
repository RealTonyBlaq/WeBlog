#!/usr/bin/env python3
""" Secondary Tables for Many-to-Many relationship """

from sqlalchemy import Table, Column, String, ForeignKey, INTEGER
from models.base import Base


# Secondary table for User -> Posts (posts liked by user)
# and Post -> User (Users that like post)
user_post_likes = Table(
    'user_post_likes',
    Base.metadata,
    Column('author_id', String(60), ForeignKey('users.id'), primary_key=True),
    Column('post_id', String(60), ForeignKey('posts.id'), primary_key=True)
)

# Secondary table for User -> Posts (bookmarks)
# and Post -> User
user_post = Table(
    'user_post',
    Base.metadata,
    Column('author_id', String(60), ForeignKey('users.id'), primary_key=True),
    Column('post_id', String(60), ForeignKey('posts.id'), primary_key=True)
)

user_tag = Table(
    'user_tag',
    Base.metadata,
    Column('user_id', String(60), ForeignKey('users.id'), primary_key=True),
    Column('tag_id', String(60), ForeignKey('tags.id'), primary_key=True)
)

post_tag = Table(
    'post_tag',
    Base.metadata,
    Column('post_id', String(60), ForeignKey('posts.id'), primary_key=True),
    Column('tag_id', String(60), ForeignKey('tags.id'), primary_key=True)
)

comment_likes = Table(
    'comment_likes',
    Base.metadata,
    Column('comment_id', INTEGER, ForeignKey('comments.id'), primary_key=True),
    Column('user_id', String(60), ForeignKey('users.id'), primary_key=True)
)