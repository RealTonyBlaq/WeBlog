"""Defines the Me (User) routes"""
from api.v1.views import app_views
from bcrypt import gensalt, hashpw
from flask import jsonify, request
from flask_login import login_required, logout_user, current_user, login_fresh
from models.user import User
from models.post import Post
from models.tag import Tag
from sqlalchemy.exc import IntegrityError
from utils import db
from utils.get_all import get_model_instances
from werkzeug.exceptions import BadRequest


@app_views.route("/me", methods=["GET", "PATCH", "DELETE"],
                 strict_slashes=False)
@login_required
def profile():
    """
    ** API endpoint for a user's profile ***
    GET - returns a user's profile
    PUT - updates a user's profile
    DELETE - deletes a user 
    """
    allowed_attributes = [
        "avatar_url",
        "email",
        "first_name",
        "last_name",
        "username",
        "password"
    ]
    if request.method == "GET":
        # return profile data
        return jsonify({'user': current_user.to_dict(), 'status': 'success'})

    if request.method == "PATCH":
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'message': 'Empty dataset'}), 400

        # if password is present, verify properties
        if data.get('password'):
            # check if login is fresh
            if not login_fresh():
                return jsonify({'message': 'Current login not fresh'}), 400
            password = data.get('password').strip()
            confirm_password = data.get('confirm_password').strip()
            if not confirm_password:
                return jsonify({'message': 'confirm_password missing'}), 400
            if password != confirm_password:
                return jsonify({'message': 'Passwords do not match'}), 400
            # hash users password
            salt = gensalt()
            hashed_password = hashpw(password.encode('utf-8'), salt)

        for k, v in data.items():
            # skip this attribute
            if k == 'confirm_password':
                continue
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'message': f'Cannot update attribute - {k}'}), 400
            if k == 'email':
                # check if login is fresh
                if not login_fresh():
                    return jsonify({'message': 'Current login not fresh'}), 400
                # check that email is valid
                # if not await verify_email(email):
                #     return jsonify({'message': 'Invalid email'}), 400
                # make sure no other user is using that email
                another_user = db.query(User).filter(User.email == v).first()
                if another_user and another_user.id != current_user.get_id():
                    return jsonify({'message': f'Cannot update attribute - {k}, {v} already in use'}), 400
                
            if len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            setattr(current_user, k, hashed_password if k == 'password' else v.strip())

        # save changes
        try:
            current_user.save()
        except IntegrityError as f:
            return jsonify({'message': f'{f}'})

        msg = 'Profile updated successfully.'
        return jsonify({'message': msg, 'user': current_user.to_dict()}), 200
    
    if request.method == 'DELETE':
        # delete user
        logout_user(current_user)
        current_user.delete()
        return jsonify({}), 200


@app_views.route('/my_posts', methods=['GET', 'POST'],
                 strict_slashes=False)
@app_views.route('/my_posts/<post_id>',
                 methods=['GET', 'PUT', 'DELETE'], strict_slashes=False)
@login_required
def my_posts(post_id=None):
    """
    **API endpoint for a user's published articles**

    GET - returns all articles published by a user
    POST - creates an article
    PUT - updates an article
    DELETE - deletes an article
    """
    allowed_attributes = [
        "header_url",
        "title",
        "body"
    ]
    user_id = current_user.get_id()

    if request.method == 'GET':
        if post_id:
            # this returns an article
            article = db.query(Post).filter(Post.id == post_id).first()
            if not article:
                return jsonify({'message': f'Post with id-{post_id} not found'}), 404
            return jsonify({'post': article.to_dict()}), 200
        
        # return all articles by this user
        response, code =  get_model_instances(Post, filter='author_id', filter_id=user_id)
        return jsonify(response), code
    
    if request.method == 'POST':
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'message': 'Empty dataset'}), 400
        
        header_url = data.get('header_url')
        title = data.get('title')
        body = data.get('body')

        if not title and len(title) == 0:
            return jsonify({'message': 'Missing title'}), 400
        if not body and len(body) == 0:
            return jsonify({'message': 'Missing body'}), 400
        
        post = Post(
            title=title, body=body,
            author_id=user_id, header_url=header_url
        )
        try:
            db.add(post)
            db.save()

        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})
        
        # add tags
        tag_ids = data.get('tag_ids')  # a list of tag_id's
        if tag_ids:
            if type(tag_ids) is not list:
                return jsonify({'message': f'tag_ids must be an array'}), 400
            tags = []
            for tag_id in tag_ids:
                tag = db.query(Tag).filter(Tag.id == tag_id).first()
                if not tag:
                    return jsonify({'message': f'Tag-{tag_id} not found'}), 404
                tags.append(tag)
                
            try:
                post.tags.extend(tags)
                post.save()
            except IntegrityError:
                db.rollback()
                return jsonify({'message': 'Database error'})
        
        msg = 'Post created.'
        return jsonify({'message': msg, 'tag': post.to_dict()}), 201
    
    if request.method == 'PATCH':
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'message': 'Empty dataset'}), 400
        
        # only the author of a post should be able to update it
        post = db.query(Post).filter(Post.id == post_id and Post.author_id == user_id).first()

        if not post:
            return jsonify({'message': f'Post with id-{post_id} \
                            belonging to {user_id} not found'}), 404
        
        for k, v in data.items():
        # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'message': f'Cannot update attribute - {k}'}), 400
                
            if len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            setattr(post, k, v.strip())

        # save changes
        try:
            post.save()
        except IntegrityError as f:
            return jsonify({'message': f'{f}'})
        
        # update tags
        tag_ids = data.get('tag_ids')  # a list of tag_id's
        if tag_ids:
            if type(tag_ids) is not list:
                return jsonify({'message': f'tag_ids must be an array'}), 400
            tags = []
            for tag_id in tag_ids:
                tag = db.query(Tag).filter(Tag.id == tag_id).first()
                if not tag:
                    return jsonify({'message': f'Tag-{tag_id} not found'}), 404
                tags.append(tag)
                
            try:
                post.tags = tags
                post.save()
            except IntegrityError:
                db.rollback()
                return jsonify({'message': 'Database error'})

        msg = 'Post updated successfully.'
        return jsonify({'message': msg, 'tag': post.to_dict()}), 200
    
    if request.method == 'DELETE':
        # delete post
        post = db.query(Post).filter(Post.id == post_id and Post.author_id == user_id).first()

        if not post:
            return jsonify({'message': f'Tag with id {post_id}\
                            belonging to {user_id} not found'}), 404
        
        post.delete()
        return jsonify({}), 200


@app_views.route('/me/tags', methods=['GET', 'POST'],
                 strict_slashes=False)
@app_views.route('/me/tags/<tag_id>',
                 methods=['DELETE'], strict_slashes=False)
@login_required
def my_tags(tag_id=None):
    """
    ** API endpoint for a user's tags ***
    GET - returns all tags for a user's profile
    PUT - adds a tag to a user's profile
    DELETE - deletes a tag from a user's profile
    """
    user_id = current_user.get_id()

    if request.method == 'GET':
        # find user
        return jsonify({'tags': [tag.to_dict() for tag in current_user.interested_subjects]}), 200
    
    if request.method == 'POST':
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400
        
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400
        
        if not data:
            return jsonify({'message': 'Empty dataset'}), 400
        
        tag_id = data.get('tag_id')

        if not tag_id and len(tag_id) == 0:
            return jsonify({'message': 'Missing tag_id'}), 400
        
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        
        if not tag:
            return jsonify({'message': f'Tag wit id-{tag_id} not found'}), 404
        
        try:
            current_user.interested_subjects.append(tag)
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})
        
        msg = 'Tag has been added to your list.'
        return jsonify({'message': msg,
                        'tags': [tag.to_dict() for tag in current_user.interested_subjects]}), 200

    if request.method == 'DELETE':
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400
        
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400
        
        if not data:
            return jsonify({'message': 'Empty dataset'}), 400
        
        tag_id = data.get('tag_id')

        if not tag_id and len(tag_id) == 0:
            return jsonify({'message': 'Missing tag_id'}), 400
        
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        
        if not tag:
            return jsonify({'message': f'Tag wit id-{tag_id} not found'}), 404
        
        try:
            new_list = filter(lambda x: x.id == tag_id, current_user.interested_subjects)
            current_user.interested_subjects = new_list
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})
        
        msg = 'Tag has been removed from your list.'
        return jsonify({'message': msg,
                        'tags': [tag.to_dict() for tag in current_user.interested_subjects]}), 200
