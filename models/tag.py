#!/usr/bin/env python3
""" The Tag Model """

from sqlalchemy import String, Column, ForeignKey
from models.base import BaseClass, Base


class Tag(BaseClass, Base):
    """ Defining the Tag class """
    __tablename__ = 'tags'
    name = Column(String(60), nullable=False, unique=True)
    post_id = Column(String(60), ForeignKey('posts.id'), nullable=False)
