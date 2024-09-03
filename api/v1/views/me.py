"""Defines the Me (User) routes"""
from api.v1.views import app_views
from bcrypt import gensalt, hashpw
from flask import jsonify, request
from flask_login import login_required, current_user, login_fresh
from models.comment import Comment
from models.user import User
from models.post import Post
from models.tag import Tag
from sqlalchemy.exc import IntegrityError
from utils import db
from werkzeug.exceptions import BadRequest
import math


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
        user = current_user.to_dict()
        user['tags'] = [tag.id for tag in current_user.interested_subjects]
        user['bookmarks'] = [post.id for post in current_user.bookmarks]
        user['liked_articles'] = [post.id for post in current_user.liked_articles]
        user['liked_comments'] = [comment.id for comment in current_user.liked_comments]
        return jsonify({'user': user, 'status': 'success'})

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
                return jsonify({'message': f'Cannot update \
                    attribute - {k}'}), 400
            if k == 'email':
                # check if login is fresh
                if not login_fresh():
                    return jsonify({'message': 'Current login not fresh'}), 400
                # check that email is valid
                # if not await verify_email(email):
                #     return jsonify({'message': 'Invalid email'}), 400
                # make sure no other user is using that email
                another_user = db.query(User).filter(User.email == v).first()
                if (another_user and another_user.id !=
                   current_user.get_id()):
                    return jsonify({'message': f'Cannot update attribute - \
                        {k}, {v} already in use'}), 400

            if len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            setattr(current_user,
                    k,
                    hashed_password if k == 'password' else v.strip())

        # save changes
        try:
            current_user.save()
        except IntegrityError as f:
            return jsonify({'message': f'{f}'})

        msg = 'Profile updated successfully.'
        user = current_user.to_dict()
        user['tags'] = [tag.id for tag in current_user.interested_subjects]
        user['bookmarks'] = [post.id for post in current_user.bookmarks]
        # user['articles'] = [post.to_dict() for post in current_user.articles]
        user['liked_articles'] = [post.id for post in current_user.liked_articles]
        user['liked_comments'] = [comment.id for comment in current_user.liked_comments]
        return jsonify({'message': msg, 'user': user}), 200

    if request.method == 'DELETE':
        # delete user
        current_user.delete()
        return jsonify({}), 200


@app_views.route('/my_posts', methods=['GET', 'POST'],
                 strict_slashes=False)
@app_views.route('/my_posts/<post_id>',
                 methods=['GET', 'PATCH', 'DELETE'], strict_slashes=False)
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
        "body",
        "tag_ids"
    ]
    user_id = current_user.get_id()

    if request.method == 'GET':
        if post_id:
            # this returns an article
            article = db.query(Post).filter(Post.id == post_id).first()
            if not article:
                return jsonify({'message': f'Post with id-{post_id} \
                    not found'}), 404
            article_dict = article.to_dict()
            article_dict['no_of_comments'] = len(article.comments)
            article_dict['no_of_bookmarks'] = len(article.bookmarked_by)
            article_dict['tag_ids'] = [tag.name for tag in article.tags]
            return jsonify({'post': article_dict}), 200

        # return all articles by this user
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                     or limit should not be less than 1'}, 400)

        my_articles = []
        for article in current_user.articles:
            new_obj = article.to_dict()
            new_obj['no_of_comments'] = len(article.comments)
            new_obj['no_of_bookmarks'] = len(article.bookmarked_by)
            new_obj['tags'] = [tag.name for tag in article.tags]
            my_articles.append(new_obj)
        count = len(my_articles)
        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return ({'data': my_articles, 'page': f'{page}',
                 'total_pages': f"{total_pages}"}, 200)

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

        post_dict = post.to_dict()
        if "tags" in post_dict:
            del post_dict['tags']
            post_dict["tags"] = [tag.name for tag in post.tags]
        msg = 'Post created.'
        return jsonify({'message': msg, 'post': post_dict}), 201

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
        post = db.query(Post).filter(Post.id == post_id and
                                     Post.author_id == user_id).first()

        if not post:
            return jsonify({'message': f'Post with id-{post_id} \
                            belonging to {user_id} not found'}), 404

        for k, v in data.items():
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'message': f'Cannot update \
                    attribute - {k}'}), 400

            if k != 'tag_ids' and len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            if k != 'tag_ids':
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

        post_dict = post.to_dict()
        if "tags" in post_dict:
            del post_dict['tags']
            post_dict["tags"] = [tag.name for tag in post.tags]
        msg = 'Post updated successfully.'
        return jsonify({'message': msg, 'post': post_dict}), 200

    if request.method == 'DELETE':
        # delete post
        post = db.query(Post).filter(Post.id == post_id and
                                     Post.author_id == user_id).first()

        if not post:
            return jsonify({'message': f'Post with id {post_id}\
                            belonging to {user_id} not found'}), 404

        post.delete()
        return jsonify({}), 200


@app_views.route('/me/tags', methods=['GET', 'PATCH'],
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
    if request.method == 'GET':
        # find user
        return jsonify({'tags': [tag.to_dict() for tag in
                                 current_user.interested_subjects]}), 200

    if request.method == 'PATCH':
        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'message': f'Tag wit id-{tag_id} \
                not found'}), 404

        try:
            current_user.interested_subjects.append(tag)
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'Tag has been added to your list.'
        return jsonify({'message': msg,
                        'tags': [tag.to_dict() for tag in
                                 current_user.interested_subjects]}), 200

    if request.method == 'DELETE':
        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'message': f'Tag wit id-{tag_id} \
                not found'}), 404

        try:
            new_list = list(filter(lambda x: x.id != tag_id,
                                   current_user.interested_subjects))
            current_user.interested_subjects = new_list
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'Tag has been removed from your list.'
        return jsonify({'message': msg,
                        'tags': [tag.to_dict() for tag in
                                 current_user.interested_subjects]}), 200


@app_views.route('/me/liked_articles/<post_id>',
                 methods=['PATCH', 'DELETE'], strict_slashes=False)
@login_required
def my_liked_articles(post_id=None):
    """
    ** API endpoint for a user's liked articles ***
    PATCH - adds a post to a user's liked articles
    DELETE - deletes a post from a user's liked articles
    """
    if request.method == 'PATCH':
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return jsonify({'message': f'Post wit id-{post_id} \
                not found'}), 404

        try:
            current_user.liked_articles.append(post)
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'}), 400

        msg = 'Post liked.'
        return jsonify({'message': msg,
                        'posts': [post.id for post in
                                  current_user.liked_articles]}), 200

    if request.method == 'DELETE':
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return jsonify({'message': f'Tag wit id-{post_id} \
                not found'}), 404

        try:
            new_list = list(filter(lambda x: x.id != post_id,
                                   current_user.liked_articles))
            current_user.liked_articles = new_list
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'post has been unliked.'
        return jsonify({'message': msg,
                        'posts': [post.id for post in current_user.liked_articles]}), 200


@app_views.route('/me/bookmarks',
                 methods=['GET'], strict_slashes=False)
@app_views.route('/me/bookmarks/<post_id>',
                 methods=['PATCH', 'DELETE'], strict_slashes=False)
@login_required
def my_bookmarks(post_id=None):
    """
    ** API endpoint for a user's posts ***
    PATCH - adds a post to a user's bookmarks
    DELETE - deletes a post from a user's bookmarks
    """
    if request.method == 'GET':
        bookmarks = current_user.bookmarks
        bookmarks_list = []
        for article in bookmarks:
            new_obj = article.to_dict()
            new_obj['no_of_comments'] = len(article.comments)
            new_obj['no_of_bookmarks'] = len(article.bookmarked_by)
            new_obj['tags'] = [tag.name for tag in article.tags]
            bookmarks_list.append(new_obj)
        return jsonify({'bookmarks': bookmarks_list}), 200

    if request.method == 'PATCH':
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return jsonify({'message': f'Post wit id-{post_id} \
                not found'}), 404

        try:
            current_user.bookmarks.append(post)
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'}), 400

        msg = 'Post has been added to your bookmarks.'
        return jsonify({'message': msg,
                        'posts': [post.id for post in
                                  current_user.bookmarks]}), 200

    if request.method == 'DELETE':
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return jsonify({'message': f'Tag wit id-{post_id} \
                not found'}), 404

        try:
            new_list = list(filter(lambda x: x.id != post_id,
                                   current_user.bookmarks))
            current_user.bookmarks = new_list
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'post has been removed from your bookmarks.'
        return jsonify({'message': msg,
                        'posts': [post.id for post in current_user.bookmarks]}), 200


@app_views.route('/me/liked_comments/<comment_id>',
                 methods=['PATCH', 'DELETE'], strict_slashes=False)
@login_required
def my_comments(comment_id=None):
    """
    ** API endpoint for a user's liked comments ***
    PATCH - adds a comment to a user's liked comments
    DELETE - deletes a comment from a user's liked comments
    """    
    if request.method == 'PATCH':
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            return jsonify({'message': f'comment-{comment_id} not found'}), 404
        
        try:
            current_user.liked_comments.append(comment)
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'}), 400
        
        msg = 'Comment successfully liked.'
        return jsonify({'message': msg,
                        'comments': [comment.id for comment in current_user.liked_comments]}), 200

    if request.method == 'DELETE':
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            return jsonify({'message': f'Comment-{comment_id} not found'}), 404
        
        try:
            new_list = list(filter(lambda x: x.id != int(comment_id), current_user.liked_comments))
            current_user.liked_comments = new_list
            current_user.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})
        
        msg = 'Comment successfully un-liked.'
        return jsonify({'message': msg,
                        'comments': [comment.id for comment in current_user.liked_comments]}), 200
