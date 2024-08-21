"""Defines the Comment routes"""
from api.v1.views import app_views
from flask import jsonify, request
from flask_login import login_required, current_user
from models.comment import Comment
from models.post import Post
from models.user import User
from sqlalchemy.exc import IntegrityError
from utils import db
from werkzeug.exceptions import BadRequest
import math


@app_views.route("/post/<post_id>/comments", methods=["GET"],
                 strict_slashes=False)
@app_views.route("/post/<post_id>/comments/<comment_id>", methods=["GET"],
                 strict_slashes=False)
def comments(post_id, comment_id=None):
    """
    ** API endpoint for comments under a post ***
    GET - returns all comments for a post
    GET id - returns a comment for a post
    """
    from api.v1.app import executor
    if request.method == "GET":
        if comment_id:
            # this returns a comment
            comment = db.query(Comment).filter(Comment.id == comment_id and Comment.post_id == post_id).first()
            if not comment:
                return jsonify({'error': f'Post-{post_id} with Comment-{comment_id} not found'}), 404
            # get user associated with comment
            author = comment.author
            return jsonify({'Comment': comment.to_dict(), 'Author': author.to_dict()}), 200

        # get all comments
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)

        if page < 1 or limit < 1:
            return ({'error': 'Page number\
                        or limit should not be less than 1'}, 400)
        
        # calculate start
        start = limit * (page - 1)

        # construct query
        query = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.path.asc())

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
        ]
        comments = futures[0].result()
        count = futures[1].result()

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'error': 'Page out of range'}, 404)

        comments_list = [comment.to_dict() for comment in comments]
        for comment in comments_list:
            comment['author'] = comment.author.to_dict()
        return ({'comments': comments_list, 'page': f'{page}',
                 'total_pages': f"{total_pages}"}), 200


@app_views.route('/post/<post_id>/comments', methods=['POST'], strict_slashes=False)
@app_views.route('/post/<post_id>/comments/<comment_id>', methods=['PATCH', 'DELETE'], strict_slashes=False)
@login_required
def modify_comments(post_id, comment_id):
    """ creates and modifies a comment """
    user_id = current_user.get_id()

    if request.method == 'POST':
        if not request.is_json:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'error': 'Empty dataset'}), 400
        
        content = data.get('content')
        parent_id = data.get('parent_id') # optional

        if not content and len(content) == 0:
            return jsonify({'error': 'Missing content'}), 400
        
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return jsonify({'error': f'Post-{post_id} not found'}), 400
        
        comment = Comment(
            post_id=post_id, parent_id=parent_id,
            content=content, author_id=user_id
        )
        
        try:
            db.add(comment)
            db.save()

        except IntegrityError:
            return jsonify({'error': 'Database error'})
        
        msg = 'Comment created.'
        return jsonify({'sucess': msg, 'comment': comment.to_dict()}), 201
    
    if request.method == "PATCH":
        allowed_attributes = [
            "content"
            ]
        
        if not request.is_json:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'error': 'Empty dataset'}), 400
        
        # only the author of a comment should be able to update it
        comment = db.query(Comment).filter(
            Comment.id == comment_id and Comment.post_id == post_id and Comment.author_id == user_id).first()
        if not comment:
            return jsonify({'error': f'Post-{post_id} with Comment-{comment_id} not found'}), 404

        for k, v in data.items():
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'error': f'Cannot update attribute - {k}'}), 400
                
            if len(v.strip()) == 0:
                return jsonify({'error': f'Missing {k}'}), 400
            # update attribute
            setattr(comment, k, v.strip())

        # save changes
        try:
            comment.save()
        except IntegrityError as f:
            return jsonify({'error': f'{f}'})

        msg = 'Comment updated successfully.'
        return jsonify({'sucess': msg, 'comment': comment.to_dict()}), 200
    
    if request.method == 'DELETE':
        # delete comment
        comment = db.query(Comment).filter(
            Comment.id == comment_id and Comment.post_id == post_id and Comment.author_id == user_id).first()
        if not comment:
            return jsonify({'error': f'Post-{post_id} with Comment-{comment_id} not found'}), 404
        
        comment.delete()
        return jsonify({}), 200
