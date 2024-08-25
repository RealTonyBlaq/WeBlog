#!/usr/bin/env python3
""" BaseClass Test Suite """

import unittest
from uuid import uuid4
import inspect
import models.base
from models.base import BaseClass, time
import pep8 as pycodestyle
from sqlalchemy.orm.exc import UnmappedInstanceError
from datetime import datetime


module_doc = models.base.__doc__


class TestBaseClassDocs(unittest.TestCase):
    """Tests to check the documentation and style of BaseClass"""

    @classmethod
    def setUpClass(self):
        """Set up for docstring tests"""
        self.base_funcs = inspect.getmembers(BaseClass, inspect.isfunction)

    def test_pep8_conformance(self):
        """Test that models/base.py conforms to PEP8."""
        for path in ['models/base.py',
                     'tests/test_models/test_base.py']:
            with self.subTest(path=path):
                errors = pycodestyle.Checker(path).check_all()
                self.assertEqual(errors, 0)

    def test_module_docstring(self):
        """Test for the existence of module docstring"""
        self.assertIsNot(module_doc, None,
                         "base.py needs a docstring")
        self.assertTrue(len(module_doc) > 1,
                        "base.py needs a docstring")

    def test_class_docstring(self):
        """Test for the BaseModel class docstring"""
        self.assertIsNot(BaseClass.__doc__, None,
                         "BaseClass needs a docstring")
        self.assertTrue(len(BaseClass.__doc__) >= 1,
                        "BaseClass needs a docstring")

    def test_func_docstrings(self):
        """Test for the presence of docstrings in BaseClass methods"""
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


class TestBaseClassAttributes(unittest.TestCase):
    """ Testing the BaseClass Model Attributes """

    def test_id(self):
        """ Tests the id attribute """
        base = BaseClass(**{})
        self.assertTrue(type(base.id) is str, 'Type of id must be string')

        base1 = BaseClass(**{'id': '123456'})
        self.assertTrue(base1.id != '123456',
                        'id should not be generated from parameters')

        self.assertNotEqual(base.id, base1.id, 'ids must be unique')

    def test_created_at(self):
        """ Tests the created_at attribute """
        my_time = datetime.now()
        base = BaseClass(**{})
        self.assertTrue(type(base.created_at) is datetime,
                        'created_at must be of type Datetime')
        self.assertTrue(my_time < base.created_at)

        with self.assertRaises(ValueError,
                               msg='created_at does not match time format'):
            BaseClass(**{'created_at': 'Today'})

        created_at = datetime.now()
        base1 = BaseClass(**{'created_at': created_at})
        self.assertTrue(isinstance(base1.created_at, datetime),
                        'created_at must be of type Datetime')
        self.assertTrue(base1.created_at != created_at,
                        'created_at could be generated from parameters')

    def test_updated_at(self):
        """ Tests the updated_at attribute """
        base = BaseClass(**{})
        self.assertTrue(base.created_at == base.updated_at,
                        'created_at must equal updated_at \
                        until the object has been updated')
        now = datetime.now()
        self.assertTrue(now > base.updated_at)

    def test_other_attrs(self):
        """ Tests other attributes """
        data = {
            'first_name': 'Chibuike',
            'last_name': 'Pius',
            'email': 'Chibuike@gmail.com',
            'username': 'chibyke',
            'password': 'ttest'
        }
        base = BaseClass(**data)
        self.assertTrue(base.first_name == 'Chibuike',
                        'Other attributes can be created')
        self.assertTrue(base.password == 'ttest', 'Password was not hashed')


class TestBaseClassMethods(unittest.TestCase):
    """ Testing the BaseClass methods """

    def test_to_dict(self):
        """ Tests the to_dict() """
        data = {
            'first_name': 'Chibuike',
            'last_name': 'Pius',
            'email': 'Chibuike@gmail.com',
            'username': 'chibyke',
            'password': 'ttest'
        }
        base = BaseClass(**data)
        self.assertTrue(isinstance(base.to_dict(), dict),
                        'info method did not return a dictionary')
        self.assertTrue('email' in base.to_dict(),
                        'email is missing in the object')
        self.assertFalse('password' in base.to_dict(),
                         'password should not be returned by to_dict()')
        self.assertFalse('_sa_instance_state' in base.to_dict(),
                         '_sa_instance_state key should not be in \
                             base.to_dict()')
        base_dict = {
            'first_name': "Chibuike",
            'last_name': 'Pius',
            'email': 'Chibuike@gmail.com',
            'username': 'chibyke',
            'id': base.id,
            'created_at': base.created_at.strftime(time),
            'updated_at': base.updated_at.strftime(time),
            '__class__': 'BaseClass'
        }
        self.assertDictEqual(base_dict, base.to_dict(), 'Dicts not equal')

    def test_save(self):
        """ Tests the save() """
        base = BaseClass(**{})
        with self.assertRaises(UnmappedInstanceError,
                               msg='A BaseClass obj cannot be saved \
                                   to the database'):
            base.save()

    def test_delete(self):
        """ Tests delete() """
        base = BaseClass(**{})
        with self.assertRaises(UnmappedInstanceError,
                               msg='A BaseClass obj cannot be deleted \
                                   from the database'):
            base.delete()
