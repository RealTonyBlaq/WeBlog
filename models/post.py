#!/usr/bin/env python3
""" The Post Model """

from models.associations import user_post, post_tag
from models.base import BaseClass, Base
from sqlalchemy import String, Column, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship


class Post(BaseClass, Base):
    """ Defining the Post Class """
    __tablename__ = 'posts'
    title = Column(String(256), nullable=False)
    body = Column(LONGTEXT, nullable=False)
    author_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    header_url = Column(String(100), nullable=True)
    likes = relationship('User', backref='posts', overlaps="likes,posts")
    bookmarked_by = relationship('User',
                                 secondary=user_post,
                                 back_populates='bookmarks')
    tags = relationship('Tag', secondary=post_tag,
                        back_populates='posts')
    comments = relationship('Comment', backref='posts',
                            cascade='all, delete, delete-orphan')
