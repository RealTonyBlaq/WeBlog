#!/usr/bin/env python3
""" The Post Model """

from models.associations import user_post
from models.base import BaseClass, Base
from models.tag import Tag
from sqlalchemy import String, Column, ForeignKey
from sqlalchemy.orm import relationship


class Post(BaseClass, Base):
    """ Defining the Post Class """
    __tablename__ = 'posts'
    title = Column(String(256), nullable=False)
    body = Column(String(1024), nullable=False)
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    likes = relationship('User', backref='posts', overlaps="likes,posts")
    bookmarked_by = relationship('User',
                                 secondary=user_post,
                                 back_populates='posts')
    tags = relationship('Tag', backref='posts')
    comments = relationship('Comment', backref='posts',
                            cascade='all, delete, delete-orphan')
