#!/usr/bin/env python3
""" The Comment Model """

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship, backref
from models.base import BaseClass, Base


class Comment(BaseClass, Base):
    """ Schema for the Comment class """
    __tablename__ = 'comments'
    id = Column(String(60), primary_key=True)
    post_id = Column(String(60), ForeignKey('posts.id'), nullable=False)
    parent_id = Column(String(60), ForeignKey('comments.id'), nullable=True)
    content = Column(Text, nullable=False)
    replies = relationship('Comment',
                           backref=backref('parent', remote_side=[id]),
                           cascade='all, delete-orphan')
