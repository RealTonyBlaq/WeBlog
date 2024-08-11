#!/usr/bin/env python3
""" Base Model for other models """

from bcrypt import gensalt, hashpw
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime
from uuid import uuid4


Base = declarative_base()


def _hash(password) -> str:
    """ Returns a hashed password """
    salt = gensalt()
    return hashpw(password, salt)


class BaseClass:
    """ Defining the Base Model class attributes """
    id = Column(String(60), nullable=False, primary_key=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    def __init__(self, **kwargs: dict) -> None:
        """ Initializing the attributes """
        self.id = str(uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

        for key, Value in kwargs.items():
            if key not in ['id', 'created_at', 'updated_at']:
                setattr(self, key, Value)

    def info(self) -> dict:
        """ Returns a dictionary of the object attributes """
        obj = {}
        for key, value in self.__dict__.items():
            if key not in ['password', '_sa_instance_state']:
                obj[key] = value

        return obj

    def save(self):
        """ Saves an object to the database """
        from utils.database import storage
        storage.new(self)
        storage.save(self)
