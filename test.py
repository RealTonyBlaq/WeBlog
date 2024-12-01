#!/usr/bin/env python3
""" Testing the Classes """

from utils import db
from dotenv import load_dotenv, find_dotenv
from models.comment import Comment
from models.user import User
from models.post import Post
from models.base import Base
from models.tag import Tag


path = find_dotenv()
load_dotenv(path)

user = db.query(User).filter_by(email='ifeanyiikpenyi@yahoo.com').first()
posts = db.query(Post)

for post in posts:
    for comment in post.comments:
        if comment.author_id == user.id:
            print('My comment - {}'.format(comment.to_dict()))

if user:
    print(user.to_dict())
    print(user.articles[0].to_dict())
    print(f'Others => {user.articles}')
    print('Done')
else:
    print('Not Done')
