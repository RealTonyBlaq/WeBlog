#!/usr/bin/env python3
""" Test Suite for Post """

from datetime import datetime
import inspect
import models.post
from models.post import Post
import pep8 as pycodestyle
from utils import db
import unittest


module_doc = models.post.__doc__


class TestPostClassDocs(unittest.TestCase):
    """Tests to check the documentation and style of Post """

    @classmethod
    def setUpClass(self):
        """Set up for docstring tests"""
        self.base_funcs = inspect.getmembers(Post, inspect.isfunction)

    def test_pep8_conformance(self):
        """Test that models/post, two ceekends conforms to PEP8."""
        for path in ['models/post.py',
                     'tests/test_models/test_post.py']:
            with self.subTest(path=path):
                errors = pycodestyle.Checker(path).check_all()
                self.assertEqual(errors, 0)

    def test_module_docstring(self):
        """Test for the existence of module docstring"""
        self.assertIsNot(module_doc, None,
                         ".py needs a docstring")
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
