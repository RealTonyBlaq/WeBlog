#!/usr/bin/env python3
""" The Database Model """

from os import getenv
from dotenv import load_dotenv, find_dotenv
from models.base import Base
from models.comment import Comment
from models.post import Post
from models.tag import Tag
from models.user import User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy_utils import create_database, database_exists


dotenv_path = find_dotenv()
print(f"Loading .env file from: {dotenv_path}")
load_dotenv(dotenv_path)


classes = {"User": User, "Post": Post, "Tag": Tag, "Comment": Comment}


class Storage:
    """ The Database Class """
    __engine = None
    __session = None

    def __init__(self) -> None:
        """ Initializes the DB """
        user = getenv('WEBLOG_DEV')
        password = getenv('WEBLOG_DEV_PWD')
        database = getenv('WEBLOG_DB')
        host = getenv('WEBLOG_HOST')
        env = getenv('WEBLOG_ENV')

        # Check if all environmental variables are set and raise an Error
        # where necessary
        if None in (user, password, database, host, env):
            err = "One or more required environment variables are not set."
            raise ValueError(err)

        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.format(
          user, password, host, database),
          # recycle connections older than an hour to avoid timeouts
          pool_recycle=3600,
          connect_args={"connect_timeout": 10}
          )

        # check if database already exists
        if not database_exists:
            # create one
            create_database(self.__engine.url)

    def reload(self):
        """reloads data from the database"""
        env = getenv('WEBLOG_ENV')
        if env == "test":
            Base.metadata.drop_all(self.__engine)
        Base.metadata.create_all(self.__engine)
        sess_factory = sessionmaker(bind=self.__engine, expire_on_commit=False)
        Session = scoped_session(sess_factory)
        self.__session = Session

    def add(self, obj):
        """ Adds an obj to the database session """
        self.__session.add(obj)

    def save(self):
        """ Commits the changes in the database session """
        self.__session.commit()

    def delete(self, obj):
        """ Deletes an object from storage """
        if obj is not None:
            self.__session.delete(obj)

    def close(self):
        """ Closes the current session """
        self.__session.remove()

    def all(self, cls=None) -> dict:
        """
        Query on the current database session and
        returns a dictionary of objects saved in the database
        """
        # this should always return a dict
        objs_dict = {}
        for clas in classes:
            if cls is None or cls is clas or cls is classes[clas]:
                objs = self.__session.query(classes[clas]).all()
                for obj in objs:
                    key = f'{obj.__class__.__name__}.{obj.id}'
                    objs_dict[key] = obj
        return objs_dict

    def get(self, cls, id):
        """
        Returns the object based on the class name and its ID, or
        None if not found
        """
        from utils import db
        if cls not in classes.values():
            return None

        all_objects = db.all(cls)
        for value in all_objects.values():
            if (value.id == id):
                return value

        return None

    def count(self, cls=None):
        """
        count the number of objects in storage
        """
        from utils import db
        count = 0
        if not cls:
            for clas in classes.values():
                count += len(db.all(clas).values())
        else:
            count = len(db.all(cls).values())

        return count

    def query(self, cls):
        """ give access to the current session outside this module"""
        return self.__session.query(cls)

    def rollback(self):
        """rollback"""
        self.__session.rollback()
