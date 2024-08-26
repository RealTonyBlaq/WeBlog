#!/usr/bin/env python3
""" The User Model inherits from BaseClass """

from datetime import datetime
from flask_login import UserMixin
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from models.associations import user_post, user_tag, user_post_likes
from models.base import BaseClass, Base
from models.post import Post
from models.tag import Tag
from models.comment import Comment


class User(UserMixin, BaseClass, Base):
    """ Defining the User Model class attributes """
    __tablename__ = 'users'
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(60), nullable=False, unique=True)
    last_login = Column(DateTime, default=datetime.now())
    password = Column(String(60), nullable=False)
    is_logged_in = Column(Boolean, default=False)
    is_email_verified = Column(Boolean, default=False)
    username = Column(String(25), nullable=True, unique=True)
    avatar_url = Column(String(100), nullable=True)
    # added attribute for checking role
    is_admin = Column(Boolean, default=False)
    # articles liked, many to many
    liked = relationship('Post', secondary=user_post_likes,
                         back_populates='likes')
    articles = relationship('Post', backref='author',
                            cascade='all, delete, delete-orphan')
    bookmarks = relationship('Post', secondary=user_post,
                             back_populates='bookmarked_by')
    interested_subjects = relationship('Tag', secondary=user_tag,
                                       back_populates='authors')

    @property
    def is_active(self):
        """Checks whether a user is active"""
        return self.is_email_verified

    @property
    def is_authenticated(self):
        """ Checks if a user is logged in """
        return self.is_logged_in

    def generate_reset_password_token(self):
        """Generates a reset password token"""
        from api.v1.app import app
        from itsdangerous import URLSafeTimedSerializer
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        return serializer.dumps(self.email, salt=self.password)

    @staticmethod
    def validate_reset_password_token(token, user_id):
        """Validates a reset password token"""
        from api.v1.app import app
        from utils import db
        from itsdangerous import URLSafeTimedSerializer

        # find user by user_id
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        try:
            token_email = serializer.loads(
                    token, salt=user.password,
                    max_age=3600
                )
        except Exception:
            return False
        if token_email != user.email:
            return None
        return user
