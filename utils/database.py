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
from typing import Union
from sqlalchemy.exc import NoResultFound, InvalidRequestError


class Storage:
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

    def add(self, obj):
        """ Adds an obj to the database session """
        self._session.add(obj)

    def save(self):
        """ Commits the changes in the database session """
        self._session.commit()

    def delete(self, obj):
        """ Deletes an object from storage """
        self._session.delete(obj)
        self._session.commit()

    def close(self):
        """ Closes the current session """
        self._session.close_all()

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

    def create_user(self, data: dict) -> User:
        """ Creates & saves a User Object and returns it """
        for key in ['first_name', 'last_name', 'email', 'password', 'username']:
            if key not in data:
                raise TypeError(f'{key} missing')

        user = self.retrieve_obj_by(User, email=data['email'])
        if user is None:
            new_user = User(**data)
            new_user.save()
            return new_user

        raise ValueError('User already exists')

    def retrieve_obj_by(self, cls: Union[User, Post, Tag], **kwargs) -> User | None:
        """
        Retrieves an object from the database

        Return: The Object, otherwise None
        """
        if kwargs:
            try:
                user = self._session.query(cls).filter_by(**kwargs).first()
                return user
            except (NoResultFound, InvalidRequestError):
                pass
        return None

    def create_post(self, data: dict) -> Post:
        """
        Creates a Post if the user_id is valid

        Return: The created post
        """
        for key in ['title', 'body', 'user_id']:
            if key not in data:
                raise TypeError(f'{key} missing')

        user_id = data['user_id']
        user = self.retrieve_obj_by(User, id=user_id)
        if user:
            new_post = Post(**data)
            new_post.save()
            user.posts.append(new_post)
            user.save()
            return new_post

        raise ValueError(f'User with id {user_id} does not exist')    


DB = Storage()
