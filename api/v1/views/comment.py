"""Defines the Comment routes"""
from api.v1.views import app_views
from flask import jsonify, request
from flask_login import login_required, current_user
from models.comment import Comment
from models.post import Post
from sqlalchemy import and_, text
from sqlalchemy.exc import IntegrityError
from utils import db
from werkzeug.exceptions import BadRequest
import math


@app_views.route("/posts/<post_id>/comments", methods=["GET"],
                 strict_slashes=False)
def comments(post_id):
    """
    ** API endpoint for comments under a post ***
    GET - returns comments for a post
    """
    from api.v1.app import executor
    if request.method == "GET":
        # get all comments
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=4)
        # get order
        order = request.args.get('order', type=str, default='oldest')

        if order not in ['oldest', 'latest', 'top']:
            return jsonify({'message': 'Comment order unspecified - oldest, latest, top'}), 400

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                        or limit should not be less than 1'}, 400)

        # calculate start
        start = limit * (page - 1)

        # construct query based on order
        q = db.query(Comment).filter(and_(Comment.post_id == post_id),
                                     Comment.parent_id == None)
        if order != 'top':
            if order == 'oldest':
                query = q.order_by(Comment.id.asc())
            elif order == 'latest':
                query = q.order_by(Comment.id.desc())
            
            futures = [
                executor.submit(query.slice, start, start + limit),
                executor.submit(query.count)
            ]
            comments = futures[0].result()
            count = futures[1].result()
        else:
            query = db._Storage__session.execute(
                text('SELECT comments.*, COUNT(comment_likes.user_id) AS likes, reply_count, \
                     first_name, last_name, avatar_url\
                     FROM comments LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id \
                     LEFT OUTER JOIN \
                        (SELECT comments.id, COUNT(replies.id) AS reply_count FROM comments \
                        LEFT OUTER JOIN comments AS replies ON comments.id = replies.parent_id GROUP BY comments.id \
                        ORDER BY reply_count DESC) AS replies_t ON comments.id = replies_t.id \
                     LEFT OUTER JOIN \
                        (SELECT id, first_name, last_name, avatar_url FROM users) AS comment_authors \
                     ON comments.author_id = comment_authors.id \
                     WHERE comments.parent_id IS NULL AND comments.post_id = :post_id \
                     GROUP BY comments.id ORDER BY likes DESC, (likes + replies_t.reply_count) DESC\
                     LIMIT :limit OFFSET :skip;'),
                     {'post_id': post_id, 'limit': limit, 'skip': (page - 1) * limit})
            
            comments_list = []
            for comment in query:
                obj = {'author': {}}
                obj['id'], obj['post_id'], obj['author_id'], obj['parent_id'],\
                    obj['content'], obj['path'], obj['created_at'], obj['updated_at'],\
                        obj['likes'], obj['replies'], obj['author']['first_name'], obj['author']['last_name'],\
                            obj['author']['avatar_url'] = comment
                comments_list.append(obj)
            
            count = db.query(Comment).filter(and_(Comment.post_id == post_id),
                                     Comment.parent_id == None).count()

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        if order != 'top':
            comments_list = []
            for value in comments:
                comment = value
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
        limit = request.args.get('limit', type=int, default=2)

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                        or limit should not be less than 1'}, 400)

        # calculate start
        start = limit * (page - 1)

        # construct query - order by likes
        query = db._Storage__session.execute(
            text('SELECT comments.*, COUNT(comment_likes.user_id) AS likes, reply_count, \
                 first_name, last_name, avatar_url\
                 FROM comments LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id \
                 LEFT OUTER JOIN \
                 (SELECT comments.id, COUNT(replies.id) AS reply_count FROM comments \
                 LEFT OUTER JOIN comments AS replies ON comments.id = replies.parent_id GROUP BY comments.id \
                 ORDER BY reply_count DESC) AS replies_t ON comments.id = replies_t.id \
                 LEFT OUTER JOIN \
                 (SELECT id, first_name, last_name, avatar_url FROM users) AS comment_authors \
                 ON comments.author_id = comment_authors.id WHERE comments.parent_id = :parent_id\
                 GROUP BY comments.id ORDER BY likes DESC, (likes + replies_t.reply_count) DESC\
                 LIMIT :limit OFFSET :skip;'),
                 {'parent_id': comment_id, 'limit': limit, 'skip': (page - 1) * limit})
            
        comments_list = []
        for comment in query:
            obj = {'author': {}}
            obj['id'], obj['post_id'], obj['author_id'], obj['parent_id'],\
                obj['content'], obj['path'], obj['created_at'], obj['updated_at'],\
                    obj['likes'], obj['replies'], obj['author']['first_name'], obj['author']['last_name'],\
                        obj['author']['avatar_url'] = comment
            comments_list.append(obj)
            
        count = db.query(Comment).filter(Comment.parent_id == comment_id).count()

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

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
        comment_dict['likes'] = len(comment.liked_by)
        comment_dict['replies'] = len(comment.replies)
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
        comment_dict = comment.to_dict()
        if 'parent' in comment_dict:
            del comment_dict['parent']
        comment_dict['likes'] = len(comment.liked_by)
        comment_dict['replies'] = len(comment.replies)
        comment_dict['author'] = {'first_name': current_user.first_name,
                                  'last_name': current_user.last_name,
                                  'id': current_user.id,
                                  'avatar_url': current_user.avatar_url,
                                  'email': current_user.email}
        return jsonify({'message': msg, 'comment': comment_dict}), 200

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
