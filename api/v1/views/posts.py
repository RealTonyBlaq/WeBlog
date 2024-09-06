"""Defines the Post routes"""
from api.v1.views import app_views, admin_required
from flask import jsonify, request
from flask_login import login_required
from models.post import Post
from sqlalchemy import and_
from utils import db
import math


@app_views.route("/posts", methods=["GET"], strict_slashes=False)
def get_posts():
    """
    GET - returns all postss
    """
    if request.method == "GET":
        from api.v1.app import executor
        # get all posts
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)

        if page < 1 or limit < 1:
            return jsonify({'message': 'Page number\
                        or limit should not be less than 1'}), 400

        # calculate start and end
        start = limit * (page - 1)

        query = db.query(Post).filter(Post.is_published == True)

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
            ]
        objs = futures[0].result()
        count = futures[1].result()

        # list to be returned
        objs_list = []
        # add tags and number of comments to each object
        for obj in objs:
            new_obj = obj.to_dict()
            if new_obj.get('__class__') == 'Post':
                new_obj['author'] = f"{obj.author.first_name} \
                    {obj.author.last_name}"
                new_obj['author_avatar'] = obj.author.avatar_url
                new_obj['no_of_comments'] = len(obj.comments)
                new_obj['no_of_likes'] = len(obj.liked_by)
                new_obj['tags'] = [tag.name for tag in obj.tags]
            objs_list.append(new_obj)

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return jsonify({'data': objs_list, 'page': f'{page}',
             'total_pages': f"{total_pages}"}), 200


@app_views.route("/search", methods=["GET"], strict_slashes=False)
def search_posts():
    """
    GET - returns posts matching the query
    """
    if request.method == "GET":
        from api.v1.app import executor
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)

        q = request.args.get('q', default="")
        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                     or limit should not be less than 1'}, 400)
        # calculate start and end
        start = limit * (page - 1)
        if q:
            query = db.query(Post).filter(and_(Post.title.ilike(f'%{q}%'),
                                               Post.is_published == True))
        else:
            query = db.query(Post).filter(Post.is_published == True)

        futures = [
            executor.submit(query.slice, start, start + limit),
            executor.submit(query.count)
            ]
        posts = futures[0].result()
        count = futures[1].result()

        # list to be returned
        posts_list = []
        # add tags and number of comments to each object
        for post in posts:
            post_obj = post.to_dict()
            post_obj['author'] = f"{post.author.first_name} \
                {post.author.last_name}"
            post_obj['author_avatar'] = post.author.avatar_url
            post_obj['no_of_comments'] = len(post.comments)
            post_obj['bookmarks'] = len(post.bookmarked_by)
            post_obj['likes'] = len(post.liked_by)
            post_obj['tags'] = [tag.name for tag in post.tags]
            posts_list.append(post_obj)

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return ({'data': posts_list, 'page': f'{page}',
                 'total_pages': f"{total_pages}"}, 200)


@app_views.route("/posts/<post_id>", methods=["GET"], strict_slashes=False)
def get_post(post_id=None):
    """
    GET - retrieves an article
    """
    # this returns an article
    article = db.query(Post).filter(and_(Post.id == post_id, Post.is_published == True)).first()
    if not article:
        return jsonify({'message': f'Post with id-{post_id} not found'}), 404
    return jsonify({'post': article.to_dict(),
                    'tags': [tag.name for tag in article.tags],
                    'likes': len(article.liked_by),
                    'author': {'first_name': article.author.first_name,
                               'last_name': article.author.last_name,
                               'bio': article.author.bio,
                               'id': article.author.id,
                               'avatar_url': article.author.avatar_url,
                               'email': article.author.email}}), 200


@app_views.route("/posts/<post_id>", methods=["DELETE"], strict_slashes=False)
@login_required
@admin_required
def delete_post(post_id=None):
    """
    POST - creates a tag
    PUT - updates a tag
    DELETE - deletes a tag
    """
    # delete post
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        return jsonify({'message': 'Post with id not found'}), 404

    post.delete()
    return jsonify({}), 200
