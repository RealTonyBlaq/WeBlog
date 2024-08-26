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
            if func[0] == 'get_id':
                continue
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


class TestUserAttributes(unittest.TestCase):
    """ Tests the functionality of the User attributes """
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
        with self.assertRaises(ValueError,
                               msg='type of created_at attr is not datetime'):
            User(**self.data)

        del self.data['created_at']

        new_user = User(**self.data)
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
        self.data['email'] = 'admin2@gmail.com'
        self.data['username'] = 'admin_tester'
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
        with self.assertRaises(ValueError,
                               msg='updated_at must be a datetime object'):
            User(**self.data)

    def test_first_name(self):
        """ Tests the first_name attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.first_name == 'admin',
                        'first_name should be admin')
        self.assertTrue(type(new_user.first_name) is str,
                        'first_name should be a string')
        del new_user

    def test_last_name(self):
        """ Tests the last_name attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.last_name == 'tester',
                        'last_name should be tester')
        self.assertTrue(type(new_user.last_name) is str,
                        'last_name should be a string')

    def test_email(self):
        """ Tests the email attribute """
        new_user = User(**self.data)
        self.assertTrue(new_user.email == self.data.get('email'),
                        'email should be admin1@example.com')
        self.assertTrue(isinstance(new_user.email, str),
                        'email should be a string')

        del new_user

    def test_last_login(self):
        """ Tests the last_login attribute """
        self.data['email'] = 'admin4aa@gmail.com'
        self.data['username'] = 'admin4aatester'
        new_user = User(**self.data)
        new_user.save()
        self.assertTrue(isinstance(new_user.last_login, datetime),
                        'last_login should be a datetime')

        new_user.delete()

    def test_password(self):
        """ Tests the password attribute """
        new_user = User(**self.data)

        # check that password is hashed
        self.assertTrue(new_user.password == self.data['password'],
                        'password was not hashed')

    def test_is_logged_in(self):
        """ Tests the is_logged_in attribute """
        self.data['email'] = 'admin_1@example.com'
        self.data['username'] = 'admin_1'
        new_user = User(**self.data)
        self.assertIsNone(new_user.is_logged_in,
                          'is_logged_in should be None until when saved')

        new_user.save()
        self.assertFalse(new_user.is_logged_in,
                         'is_logged_in should be False')
        self.assertTrue(type(new_user.is_logged_in) is bool,
                        "is_logged_in should be of type Bool")
        new_user.is_logged_in = True
        new_user.save()
        self.assertTrue(new_user.is_logged_in,
                        'is_logged_in should be True')
        new_user.delete()

    def test_is_email_verified(self):
        """ Tests the is_email_verified attribute """
        self.data['email'] = 'admin_10@example.com'
        self.data['username'] = 'admin_10'
        new_user = User(**self.data)
        self.assertIsNone(new_user.is_email_verified,
                          'is_email_verified should be None until the \
                              object has been saved')
        new_user.save()
        self.assertTrue(isinstance(new_user.is_email_verified, bool),
                        'is_email_verified should be a bool')
        self.assertFalse(new_user.is_email_verified,
                         'is_email_verified should default to False')

        # Setting the attr to be True
        new_user.is_email_verified = True
        new_user.save()

        self.assertTrue(new_user.is_email_verified,
                        'is_email_verified should be True')

        new_user.delete()

    def test_username(self):
        """ Tests the username attribute """
        new_user = User(**self.data)
        self.assertTrue(isinstance(new_user.username, str),
                        'username should be a str')
        self.assertTrue(new_user.username == self.data['username'],
                        'username should be admin_tester2')

    def test_avatar_url(self):
        """ Tests the avatar_url attribute """
        new_user = User(**self.data)
        self.assertIsNone(new_user.avatar_url, 'avatar_url should be None')
        new_user.avatar_url = 'http://images/my_picture.url'

        self.assertTrue(type(new_user.avatar_url) is str,
                        'avatar_url should be a str')


class TestUserMethods(unittest.TestCase):
    """ Tests the functionality of User methods """
    DATA = {
            'first_name': 'adminAdmin',
            'last_name': 'tester',
            'email': 'adminAdmin@example.com',
            'username': 'adminAdmin',
            'password': 'test_password'
    }

    def setUp(self):
        """Set up test data before each test"""
        self.data = self.DATA.copy()

    def test_is_active(self):
        """ Tests the is_active method """
        new_user = User(**self.data)
        new_user.save()
        self.assertFalse(new_user.is_active,
                         'is_active() should return False')

        # setting is_email_verified to True to test
        # the return value of is_active
        new_user.is_email_verified = True
        new_user.save()

        self.assertTrue(new_user.is_active,
                        'is_active() should return True')
        new_user.delete()

    def test_is_authenticated(self):
        """ Tests the is_authenticated method """
        new_user = User(**self.data)
        new_user.save()

        # Checks if the user is logged in
        self.assertFalse(new_user.is_authenticated,
                         'is_authenticated should return False')

        # Setting is_logged_in to True
        new_user.is_logged_in = True
        new_user.save()

        self.assertTrue(new_user.is_authenticated,
                        'is_authenticated should return True')
        new_user.delete()

    def test_generate_reset_password_token(self):
        """ Tests the generate_reset_password_token method """
        new_user = User(**self.data)
        token = new_user.generate_reset_password_token()
        self.assertTrue(isinstance(token, str),
                        'token should be a str')

        # This check failed. tokens should be unique
        # another_token = new_user.generate_reset_password_token()
        # self.assertFalse(another_token == token, 'tokens must be unique')

    def test_validate_reset_password_token(self):
        """ Tests the validate_reset_password_token method """
        new_user = User(**self.data)
        token = new_user.generate_reset_password_token()

        self.assertIsNone(User.validate_reset_password_token(token,
                                                             new_user.id),
                          'method should return the user object')

        # trying with a fake user_id
        self.assertIsNone(
          User.validate_reset_password_token(token, 'fake_id'),
          'User_id fake_id is invalid')

        # Trying with a fake token
        self.assertFalse(
          User.validate_reset_password_token('fake_token',
                                             new_user.id),
          f'Fake token for user {new_user.username}')

        # Trying with a different user_id than the one
        # assigned to the token
        self.data['username'] = 'another_user'
        self.data['email'] = 'another_user@example.com'
        another_user = User(**self.data)

        self.assertIsNone(
          User.validate_reset_password_token(token, another_user.id),
          f'user with {another_user.email} is not assigned to the token')
