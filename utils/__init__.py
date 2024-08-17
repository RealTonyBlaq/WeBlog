"""Initilizes the database"""
from utils.database import Storage

db = Storage()
db.reload()
