#!/usr/bin/env python3
""" The Database Model """

from os import getenv
from models.base import BaseClass, Base
from models.user import User
from models.post import Post
from models.tag import Tag
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.orm.session import Session


class DB:
    """ The Database Class """
    __session = None
    __classes = [User, Post, Tag]

    def __init__(self) -> None:
        """ Initializes the DB """
        user = getenv('WEBLOG_DEV')
        password = getenv('WEBLOG_DEV_PWD')
        database = getenv('WEBLOG_DB')
        host = getenv('WEBLOG_HOST')

        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.format(
          user, password, host, database))
        Base.metadata.create_all(self.__engine)
        self.__session = None

    @property
    def _session(self) -> Session:
        """ Returns the Session Object """
        if not self.__session:
            sess = sessionmaker(bind=self.__engine, expire_on_commit=False)
            session = scoped_session(sess)
            self.__session = session

        return self.__session

    def new(self, obj):
        """ Adds an obj to the database session """
        self._session.add(obj)

    def save(self, obj):
        """ Commits the changes in the database session """
        self._session.commit()

    def close(self):
        """ Closes the current session """
        self._session.remove()

    def all(self, cls=None) -> dict | list:
        """ Returns a list of objects saved in the database """
        
        objs = {}
        if cls:
            result = self._session.query(cls)
            for obj in result:
                objs[f'{obj.__class__.__name__}/{obj.id}'] = obj

            return objs
        else:
            all_objs = []
            for clas in self.__classes:
                class_objs = {}
                result = self._session.query(clas)
                for obj in result:
                    class_objs[f'{obj.__class__.__name__}/{obj.id}'] = obj
                all_objs.append(class_objs)

            return all_objs
        

storage = DB()