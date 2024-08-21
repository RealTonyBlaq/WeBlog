#!/usr/bin/env python3
""" The Comment Model """

from sqlalchemy import Column, ForeignKey, String, TEXT, INTEGER
from sqlalchemy.orm import relationship, backref
from models.base import BaseClass, Base


class Comment(BaseClass, Base):
    """ Schema for the Comment class """
    _N = 6

    __tablename__ = 'comments'
    id = Column(INTEGER, primary_key=True, autoincrement=True)
    post_id = Column(String(60), ForeignKey('posts.id'), nullable=False)
    # added column for author of comment
    author_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    parent_id = Column(INTEGER, ForeignKey('comments.id'), nullable=True)
    content = Column(TEXT, nullable=False)
    # used to track the level of comment and make querying easier
    path = Column(TEXT, index=True)
    replies = relationship('Comment',
                           backref=backref('parent', remote_side=[id]),
                           cascade='all, delete-orphan')
    author = relationship('User', backref=backref('comments', cascade='all, delete-orphan'))
    
    def save(self):
        """updates the attribute 'updated_at' with the current datetime"""
        super().save()
        if not self.path:
            from utils import db
            prefix = self.parent.path + '.' if self.parent else ''
            self.path = prefix + '{:0{}d}'.format(self.id, self._N)
            db.save()

    def level(self):
        return len(self.path)
