#!/usr/bin/env python3
""" Test Suite for the User Model """

from bcrypt import checkpw
from datetime import datetime
import inspect
from models.user import User
import models.user
import pep8 as pycodestyle
import time
import unittest


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
    DATA = {
            'first_name': 'admin',
            'last_name': 'tester',
            'email': 'admin1@example.com',
            'username': 'admin_tester2',
            'password': 'test_password'
    }

    def setUp(self):
        """Set up test data before each test"""
        self.data = self.DATA.copy()

    def test_initialization(self):
        """ Tests the User Object creation """
        user = User(**self.data)
        self.assertIsNotNone(user, 'User object was not created')

        with self.assertRaises(ValueError, msg='No kwargs were passed'):
            User()

    def test_id(self):
        """ Tests the id attribute """
        self.data['id'] = None

        new_user = User(**self.data)
        new_user_2 = User(**self.data)

        self.assertIsNotNone(new_user.id, 'id cannot be None')
        self.assertTrue(type(new_user.id) is str,
                        'id should be a string object')
        self.assertTrue(new_user.id != new_user_2.id, 'ids must be unique')

        self.data['id'] = '123456789'
        new_user_3 = User(**self.data)
        self.assertFalse(new_user_3.id == '123456789',
                         'id must be auto-generated and unique')

    def test_created_at(self):
        """ Tests the created_at attribute """
        self.data['created_at'] = 'Today'
        new_user = User(**self.data)

        self.assertFalse(new_user.created_at == 'Today',
                         'created_at should be auto-generated')
        self.assertTrue(isinstance(new_user.created_at, datetime),
                        'created_at should be a datetime object')

        time.sleep(2)

        new_user2 = User(**self.data)
        self.assertTrue(new_user.created_at != new_user2.created_at,
                        'Time created should be different')
        self.assertTrue(new_user.created_at < new_user2.created_at,
                        'Time created should be different')

    def test_updated_at(self):
        """ Tests the updated_at attribute """
        new_user = User(**self.data)

        self.assertIsNotNone(new_user.updated_at,
                             'updated_at should be auto-generated')
        self.assertTrue(isinstance(new_user.updated_at, datetime),
                        'updated_at should be a datetime object')

        time.sleep(2)

        new_user2 = User(**self.data)
        before = new_user2.updated_at
        self.assertTrue(new_user.updated_at < new_user2.updated_at,
                        'updated_at should be different for the two objects')

        time.sleep(2)

        new_user2.save()
        after = new_user2.updated_at

        self.assertTrue(before != after, 'updated_at should be updated \
            when save() is called')
        new_user2.delete()

        self.data['updated_at'] = 'Today'
        new_user3 = User(**self.data)
        self.assertTrue(new_user3.updated_at != 'Today',
                        'updated_at should be auto-generated')

    def test_first_name(self):
        """ Tests the first_name attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.first_name == 'admin',
                        'first_name should be admin')
        self.assertTrue(type(new_user.first_name) is str,
                        'first_name should be a string')
        del new_user

        # Tests User creation without a first_name
        del self.data['first_name']
        with self.assertRaises(ValueError, msg='first_name missing'):
            User(**self.data)

        # Tests User creation with first_name as an integer
        self.data['first_name'] = 200
        with self.assertRaises(TypeError,
                               msg='first_name must be a string'):
            User(**self.data)

    def test_last_name(self):
        """ Tests the last_name attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.last_name == 'tester',
                        'last_name should be tester')
        self.assertTrue(type(new_user.last_name) is str,
                        'last_name should be a string')

        del self.data['last_name']
        del new_user

        # Tests User creation without a last_name attr
        with self.assertRaises(ValueError, msg='last_name missing'):
            User(**self.data)

        self.data['last_name'] = 250
        # Tests User creation with last_name as an integer
        with self.assertRaises(TypeError, msg='last_name must be a string'):
            User(**self.data)

    def test_email(self):
        """ Tests the email attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.email == self.data.get('email'),
                        'email should be admin1@example.com')
        self.assertTrue(isinstance(new_user.email, str),
                        'email should be a string')

        del new_user

        # Tests User creation with email as an int
        self.data['email'] = 200
        with self.assertRaises(TypeError, msg='email must be a string'):
            User(**self.data)

        # Tests User creation without an email
        del self.data['email']
        with self.assertRaises(ValueError, msg='email is required'):
            User(**self.data)

    def test_last_login(self):
        """ Tests the last_login attribute """
        new_user = User(**self.data)
        self.assertIsNone(new_user.last_login,
                          'last_login will be None until the object is saved')

        new_user.save()
        self.assertTrue(isinstance(new_user.last_login, datetime),
                        'last_login should be a datetime')

        self.data['last_login'] = 'Today'
        with self.assertRaises(TypeError,
                               msg='last_login should be a datetime'):
            User(**self.data)

        new_user.delete()

    def test_password(self):
        """ Tests the password attribute """
        new_user = User(**self.data)

        # check that password is hashed
        self.assertFalse(new_user.password == self.data['password'],
                         'password was not hashed')
        self.assertTrue(checkpw(self.data['password'].encode('utf'),
                                new_user.password), 'password not hashed')

        # testing User creation without a password
        del self.data['password']
        with self.assertRaises(ValueError, msg='password is missing'):
            User(**self.data)

        # Testing User creation with password as number
        self.data['password'] = 550
        with self.assertRaises(TypeError, msg='Password must be a string'):
            User(**self.data)
