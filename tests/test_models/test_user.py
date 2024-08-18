#!/usr/bin/env python3
""" Test Suite for the User Model """

from utils.database import DB
from datetime import datetime
import inspect
from models.user import User
import models.user
import time
import unittest
import pep8 as pycodestyle
from MySQLdb import IntegrityError


module_doc = models.user.__doc__


class TestUserDocs(unittest.TestCase):
    """ Tests to check the documentation and style of the User class """

    @classmethod
    def setUpClass(self):
        """Set up for docstring tests"""
        self.base_funcs = inspect.getmembers(User, inspect.isfunction)

    def test_pep8_conformance(self):
        """Test that models/base.py conforms to PEP8."""
        for path in ['models/user.py',
                     'tests/test_models/test_user.py']:
            with self.subTest(path=path):
                errors = pycodestyle.Checker(path).check_all()
                self.assertEqual(errors, 0)

    def test_module_docstring(self):
        """Test for the existence of module docstring"""
        self.assertIsNot(module_doc, None,
                         "user.py needs a docstring")
        self.assertTrue(len(module_doc) > 1,
                        "user.py needs a docstring")

    def test_class_docstring(self):
        """ Test for the User class docstring """
        self.assertIsNot(User.__doc__, None,
                         "User class needs a docstring")
        self.assertTrue(len(User.__doc__) >= 1,
                        "User class needs a docstring")

    def test_func_docstrings(self):
        """Test for the presence of docstrings in User class methods"""
        for func in self.base_funcs:
            with self.subTest(function=func):
                self.assertIsNot(
                    func[1].__doc__,
                    None,
                    "{:s} method needs a docstring".format(func[0])
                )
                self.assertTrue(
                    len(func[1].__doc__) > 1,
                    "{:s} method needs a docstring".format(func[0])
                )


class TestUser(unittest.TestCase):
    """ Tests the functionality of the User class """
    def test_initialization_without_params(self):
        """ Tests the User Object creation """
        data = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password'
        }
        user = User(**data)
        self.assertIsNotNone(user, 'No kwargs was passed as parameter')

    def test_id(self):
        """ Tests the id attribute """
        data = {
            'id': None,
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password'
        }
        new_user = User(**data)
        new_user_2 = User(**data)

        self.assertIsNotNone(new_user.id, 'id cannot be None')
        self.assertTrue(type(new_user.id) is str,
                        'id should be a string object')
        self.assertTrue(new_user.id != new_user_2.id, 'ids must be unique')

        data['id'] = '123456789'
        new_user_3 = User(**data)
        self.assertFalse(new_user_3.id == '123456789',
                         'id must be auto-generated and unique')

    def test_created_at(self):
        """ Tests the created_at attribute """
        data = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password',
            'created_at': 'Today'
        }
        new_user = User(**data)

        self.assertFalse(new_user.created_at == 'Today',
                         'created_at should be auto-generated')
        self.assertTrue(isinstance(new_user.created_at, datetime),
                        'created_at should be a datetime object')

        time.sleep(4)

        new_user2 = User(**data)
        self.assertTrue(new_user.created_at != new_user2.created_at,
                        'Time created should be different')
        self.assertTrue(new_user.created_at < new_user2.created_at,
                        'Time created should be different')

    def test_updated_at(self):
        """ Tests the updated_at attribute """
        data = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin@example.com',
            'username': 'admin_tester',
            'password': 'test_password',
            'updated_at': 'Today'
        }

        new_user = User(**data)

        self.assertTrue(new_user.updated_at != 'Today',
                        'updated_at should be auto-generated')
        self.assertTrue(isinstance(new_user.updated_at, datetime),
                        'updated_at should be a datetime object')

        time.sleep(2)

        new_user2 = User(**data)
        before = new_user2.updated_at
        self.assertTrue(new_user.updated_at < new_user2.updated_at,
                        'updated_at should be different for the two objects')

        time.sleep(2)

        new_user2.save()
        after = new_user2.updated_at

        self.assertTrue(before != after, 'updated_at should be updated \
            when save() is called')
        new_user2.delete()

    def test_first_name(self):
        """ Tests the first_name attribute """
        data = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password'
        }
        new_user = User(**data)
        self.assertTrue(new_user.first_name == 'admin',
                        'first_name should be admin')
        self.assertTrue(type(new_user.first_name) is str,
                        'first_name should be a string')
        del new_user

        # Tests User creation without a first_name
        del data['first_name']
        with self.assertRaises(ValueError, msg='first_name missing'):
            User(**data)

        # Tests User creation with first_name as an integer
        data['first_name'] = 200
        with self.assertRaises(TypeError,
                               msg='first_name must be a string'):
            User(**data)

    def test_last_name(self):
        """ Tests the last_name attribute """
        data = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password'
        }
        new_user = User(**data)
        self.assertTrue(new_user.last_name == 'tester',
                        'last_name should be admin')
        self.assertTrue(type(new_user.last_name) is str,
                        'last_name should be a string')

        del data['last_name']
        del new_user

        # Tests User creation without a last_name attr
        with self.assertRaises(ValueError, msg='last_name missing'):
            User(**data)

        data['last_name'] = 250
        # Tests User creation with last_name as an integer
        with self.assertRaises(TypeError, msg='last_name must be a string'):
            User(**data)
