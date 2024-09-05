#!/usr/bin/env python3
""" The Post Model """

from models.associations import bookmarks, post_tag, liked_posts
from models.base import BaseClass, Base
from sqlalchemy import String, Column, Boolean, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship


class Post(BaseClass, Base):
    """ Defining the Post Class """
    __tablename__ = 'posts'
    title = Column(String(256), nullable=False)
    body = Column(LONGTEXT, nullable=False)
    author_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    header_url = Column(String(100), nullable=True)
    is_published = Column(Boolean, default=False)
    bookmarked_by = relationship('User',
                                 secondary=bookmarks,
                                 back_populates='bookmarks')
    liked_by = relationship('User', secondary=liked_posts,
                            back_populates='liked_articles')
    tags = relationship('Tag', secondary=post_tag,
                        back_populates='posts')
    comments = relationship('Comment', backref='posts',
                            cascade='all, delete, delete-orphan')
