"""Defines the Comment routes"""
from api.v1.views import app_views
from flask import jsonify, request
from flask_login import login_required, current_user
from models.comment import Comment
from models.post import Post
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from utils import db
from werkzeug.exceptions import BadRequest
import math


@app_views.route("/posts/<post_id>/comments/<order>", methods=["GET"],
                 strict_slashes=False)
def comments(post_id, order):
    """
    ** API endpoint for comments under a post ***
    GET - returns comments for a post
    """
    from api.v1.app import executor
    if request.method == "GET":
        if order not in ['oldest', 'newest', 'popular']:
            return jsonify({'message': 'Comment order unspecified'}), 400
        # get all comments
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=4)

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                        or limit should not be less than 1'}, 400)

        # calculate start
        start = limit * (page - 1)

        # construct query based on order
        if order == 'oldest':
            query = db.query(Comment).filter(
                Comment.post_id == post_id).order_by(Comment.created_at.asc())
        elif order == 'newest':
            query = db.query(Comment).filter(
                Comment.post_id == post_id).order_by(Comment.created_at.desc())
        else:
            query = db.query(Comment).filter(
                Comment.post_id == post_id).order_by(func.count(Comment.liked_by).desc())

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
        ]
        comments = futures[0].result()
        count = futures[1].result()

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        comments_list = []
        for comment in comments:
            obj = comment.to_dict()
            author = comment.author
            obj['likes'] = len(comment.liked_by)
            obj['author'] = {'first_name': author.first_name,
                             'last_name': author.last_name,
                             'id': author.id,
                             'avatar_url': author.avatar_url,
                             'email': author.email}
            obj['replies'] = len(comment.replies)
            comments_list.append(obj)
        return ({'comments': comments_list, 'page': f'{page}',
                 'total_pages': f"{total_pages}"}), 200


@app_views.route("/comments/<comment_id>", methods=["GET"],
                 strict_slashes=False)
def comments_replies(comment_id):
    """
    ** API endpoint for comments under a post ***
    GET - returns replies for a comment
    """
    from api.v1.app import executor
    if request.method == "GET":
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            return jsonify({'message': 'Comment-{comment_id} not found'}), 404
        # get all comments
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=4)

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                        or limit should not be less than 1'}, 400)

        # calculate start
        start = limit * (page - 1)

        # construct query based on order - most popular (default)
        query = db.query(Comment).filter(
                Comment.parent_id == comment_id).order_by(func.count(Comment.liked_by).desc())
        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
        ]
        comments = futures[0].result()
        count = futures[1].result()

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        comments_list = []
        for comment in comments:
            obj = comment.to_dict()
            author = comment.author
            obj['likes'] = len(comment.liked_by)
            obj['author'] = {'first_name': author.first_name,
                             'last_name': author.last_name,
                             'id': author.id,
                             'avatar_url': author.avatar_url,
                             'email': author.email}
            obj['replies'] = len(comment.replies)
            comments_list.append(obj)
        return ({'comments': comments_list, 'page': f'{page}',
                 'total_pages': f"{total_pages}"}), 200


@app_views.route('/posts/<post_id>/comments', methods=['POST'],
                 strict_slashes=False)
@app_views.route('/posts/<post_id>/comments/<comment_id>',
                 methods=['PATCH', 'DELETE'], strict_slashes=False)
@login_required
def modify_comments(post_id, comment_id=None):
    """ creates and modifies a comment """
    user_id = current_user.get_id()

    if request.method == 'POST':
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400

        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400

        if not data:
            return jsonify({'message': 'Empty dataset'}), 400

        content = data.get('content')
        parent_id = data.get('parent_id')  # optional

        if not content and len(content) == 0:
            return jsonify({'message': 'Missing content'}), 400

        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return jsonify({'message': f'Post-{post_id} not found'}), 404

        comment = Comment(
            post_id=post_id, parent_id=parent_id,
            content=content, author_id=user_id
        )

        try:
            comment.save()
        except IntegrityError as e:
            return jsonify({'message': f'Database error: {e}'}), 500

        msg = 'Comment created.'
        comment_dict = comment.to_dict()
        del comment_dict['parent']
        comment_dict['author'] = {'first_name': current_user.first_name,
                                  'last_name': current_user.last_name,
                                  'id': current_user.id,
                                  'avatar_url': current_user.avatar_url,
                                  'email': current_user.email}
        return jsonify({'message': msg, 'comment': comment_dict}), 201

    if request.method == "PATCH":
        allowed_attributes = [
            "content"
            ]
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400

        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400

        if not data:
            return jsonify({'message': 'Empty dataset'}), 400

        # only the author of a comment should be able to update it
        comment = db.query(Comment).filter(
            Comment.id == comment_id and Comment.post_id == post_id
            and Comment.author_id == user_id).first()
        if not comment:
            return jsonify({'message': f'Post-{post_id} with \
                Comment-{comment_id} not found'}), 404

        for k, v in data.items():
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'message': f'Cannot update \
                    attribute - {k}'}), 400

            if len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            setattr(comment, k, v.strip())

        # save changes
        try:
            comment.save()
        except IntegrityError as f:
            return jsonify({'message': f'{f}'})

        msg = 'Comment updated successfully.'
        return jsonify({'message': msg, 'comment': comment.to_dict()}), 200

    if request.method == 'DELETE':
        from sqlalchemy import and_
        # delete comment
        comment = db.query(Comment).filter(
            and_(Comment.id == comment_id,
                 Comment.author_id == user_id)).first()
        if not comment:
            return jsonify({'message': f'Post-{post_id} with \
                Comment-{comment_id} not found'}), 404

        comment.delete()
        msg = 'Comment deleted successfully.'
        return jsonify({'message': msg}), 200
