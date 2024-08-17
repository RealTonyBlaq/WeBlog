#!/usr/bin/env python3
""" The User Model inherits from BaseClass """

from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from models.associations import user_post, user_tag
from models.base import BaseClass, Base


class User(BaseClass, Base):
    """ Defining the User Model class attributes """
    __tablename__ = 'users'
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(60), nullable=False, unique=True)
    last_login = Column(DateTime, default=datetime.now())
    password = Column(String(60), nullable=False)
    is_email_verified = Column(Boolean, default=False)
    username = Column(String(25), nullable=True, unique=True)
    avatar_url = Column(String(100), nullable=True)
    articles = relationship('Post', backref='users',
                            cascade='all, delete, delete-orphan')
    bookmarks = relationship('Post', secondary=user_post,
                             back_populates='bookmarked_by')
    interested_subjects = relationship('Tag', secondary=user_tag,
                                       back_populates='authors')
