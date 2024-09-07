"""Defines the User routes"""
from api.v1.views import app_views, admin_required
from bcrypt import gensalt, hashpw
from flask import jsonify, request
from flask_login import login_required
from models.post import Post
from models.user import User
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from utils import db
from werkzeug.exceptions import BadRequest
import math


@app_views.route("/users", methods=["GET", "POST"], strict_slashes=False)
@app_views.route("/users/<user_id>", methods=["GET", "DELETE"], strict_slashes=False)
@login_required
@admin_required
def view_users(user_id=None):
    """
    GET - returns all users
    POST - creates a user with admin privileges
    - user_id
        GET - return user with id user_id
        DELETE - deletes a user
    """
    if request.method == "GET":
        if user_id:
            # this returns a user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return jsonify({'message': f'user with id-{user_id} \
                    not found'}), 404
            user_dict = user.to_dict()
            user_dict['no_of_articles_pub'] = len(user.articles)
            user_dict['no_of_articles_interactions'] = sum([len(article.liked_by) + \
                                                            len(article.comments) for \
                                                                article in user.articles])
            return jsonify({'user': user_dict}), 200

        # get all users
        from api.v1.app import executor
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=20)
        # get search by parameter
        by = request.args.get('by', type=str, default='id')
        # get query parameter
        q = request.args.get('q', type=str, default='')

        if page < 1 or limit < 1:
            return jsonify({'message': 'Page number\
                        or limit should not be less than 1'}), 400

        # calculate start and end
        start = limit * (page - 1)

        query = db.query(User)
        if q:
            search = f'%{q}%'
            query = db.query(User).filter(User[by].like(search))

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
            ]
        objs = futures[0].result()
        count = futures[1].result()

        # list to be returned
        objs_list = []
        # add users and number of comments to each object
        for obj in objs:
            new_obj = obj.to_dict()
            objs_list.append(new_obj)

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return jsonify({'users': objs_list, 'page': f'{page}',
             'total_pages': f"{total_pages}"}), 200
    
    if request.method == "POST":
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400

        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400

        if not data:
            return jsonify({'message': 'Empty dataset'}), 400
        
        # check that all required attributes are present
        email = data.get('email').strip()
        password = data.get('password').strip()
        confirm_password = data.get('confirm_password').strip()
        first_name = data.get('first_name').strip()
        last_name = data.get('last_name').strip()

        if not email or len(email) == 0:
            return jsonify({'message': 'Missing email'}), 400
        # check that email is valid
        # if not await verify_email(email):
        #     return jsonify({'message': 'Invalid email'}), 400

        if not password or len(password) == 0:
            return jsonify({'message': 'Missing password'}), 400
        if not confirm_password or len(confirm_password) == 0:
            return jsonify({'message': 'Missing confirm_password'}), 400
        # check that password and confirm_password match
        if password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400

        if not first_name or len(first_name) == 0:
            return jsonify({'message': 'Missing first_name'}), 400
        if not last_name or len(last_name) == 0:
            return jsonify({'message': 'Missing last_name'}), 400

        # check that email is not already in use
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return jsonify({'message': 'Email already in use'}), 400

        # hash users password
        salt = gensalt()
        hashed_password = hashpw(password.encode('utf-8'), salt)

        # create user
        user = User(
            email=email, password=hashed_password,
            first_name=first_name, last_name=last_name,
            is_email_verified=True, is_admin=True
        )
        try:
            db.add(user)
            db.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'Admin created successfully.'
        return jsonify({'message': msg}), 201
    
    if request.method == 'DELETE':
        # delete user
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return jsonify({'message': f'User with id {user_id} not found'}), 404

        user.delete()
        return jsonify({'message': 'User deleted successfully'}), 200


@app_views.route('/users/<user_id>/posts', methods=['GET'], strict_slashes=False)
@admin_required
@login_required
def user_posts(user_id=None):
    """
    **API endpoint for published articles associated with a user**

    GET - returns all published articles associated with this user
    """
    if request.method == 'GET':
        from api.v1.app import executor
        # return all articles associated with this user
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)
        # get query parameter
        q = request.args.get('q', type=str, default='')

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                     or limit should not be less than 1'}, 400)

        # calculate start and end
        start = limit * (page - 1)

        query = db.query(Post).join(User.articles).filter(and_(Post.is_published == True, User.id == user_id))
        if q:
            search = f'%{q}%'
            query = query.filter(Post.title.like(search))

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
            ]
        objs = futures[0].result()
        count = futures[1].result()

        # list to be returned
        objs_list = []
        # add users and number of comments to each object
        for obj in objs:
            new_obj = obj.to_dict()
            if new_obj.get('__class__') == 'Post':
                new_obj['author'] = f"{obj.author.first_name} \
                    {obj.author.last_name}"
                new_obj['author_avatar'] = obj.author.avatar_url
                new_obj['no_of_comments'] = len(obj.comments)
                new_obj['no_of_likes'] = len(obj.liked_by)
                new_obj['users'] = [user.name for user in obj.users]
            objs_list.append(new_obj)

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return jsonify({'data': objs_list, 'page': f'{page}',
             'total_pages': f"{total_pages}"}), 200
