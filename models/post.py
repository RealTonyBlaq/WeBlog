#!/usr/bin/env python3
""" The Post Model """

from models.base import BaseClass, Base
from models.tag import Tag
from sqlalchemy import String, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Post(BaseClass, Base):
    """ Defining the Post Class """
    __tablename__ = 'posts'
    title = Column(String(256), nullable=False)
    body = Column(String(1024), nullable=False)
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    likes = Column(Integer, default=0)
    bookmarks = Column(Integer, default=0)
    tags = relationship('Tag', backref='post',
                        cascade='all, delete, delete-orphan')
