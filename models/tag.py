#!/usr/bin/env python3
""" The Tag Model """

from sqlalchemy import String, Column
from sqlalchemy.orm import relationship
from models.associations import post_tag, user_tag
from models.base import BaseClass, Base


class Tag(BaseClass, Base):
    """ Defining the Tag class """
    __tablename__ = 'tags'
    name = Column(String(60), nullable=False, unique=True)
    posts = relationship('Post', secondary=post_tag,
                         back_populates='tags')
    authors = relationship('User', secondary=user_tag,
                           back_populates='interested_subjects')
