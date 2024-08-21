"""Defines the Post routes"""
from api.v1.views import app_views, admin_required
from flask import jsonify, request
from flask_login import login_required
from models.post import Post
from utils import db
from utils.get_all import get_model_instances


@app_views.route("/posts", methods=["GET"], strict_slashes=False)
def get_posts():
    """
    GET - returns all tags
    """
    if request.method == "GET":
        # get all posts
        response, code =  get_model_instances(Post)
        return jsonify(response), code


@app_views.route("/posts/<post_id>", methods=["GET"], strict_slashes=False)
def get_post(post_id=None):
    """
    GET - retrieves an article
    """
    # this returns an article
    article = db.query(Post).filter(Post.id == post_id).first()
    if not article:
            return jsonify({'error': f'Post with id-{post_id} not found'}), 404
    return jsonify({'post': article.to_dict()}), 200


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
        return jsonify({'error': 'Post with id not found'}), 404
        
    post.delete()
    return jsonify({}), 200