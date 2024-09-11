"""Defines the Tag routes"""
from api.v1.views import app_views, admin_required, required_params, verify_tag_available
from flask import jsonify, request
from flask_login import login_required
from models.tag import Tag
from models.post import Post
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from utils import db
from werkzeug.exceptions import BadRequest
import math


@app_views.route("/tags", methods=["GET"], strict_slashes=False)
@app_views.route("/tags/<tag_id>", methods=["GET"], strict_slashes=False)
def view_tags(tag_id=None):
    """
    GET - returns all tags
    """
    if request.method == "GET":
        if tag_id:
            # this returns a tag
            tag = db.query(Tag).filter(Tag.id == tag_id).first()
            if not tag:
                return jsonify({'message': f'tag with id-{tag_id} \
                    not found'}), 404
            return jsonify({'tag': tag.to_dict()}), 200

        # get all tags
        from api.v1.app import executor
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=20)
        # get search parameter
        q = request.args.get('q', type=str, default='')

        if page < 1 or limit < 1:
            return jsonify({'message': 'Page number\
                        or limit should not be less than 1'}), 400

        # calculate start and end
        start = limit * (page - 1)

        query = db.query(Tag)
        if q:
            search = f'%{q}%'
            print(search)
            query = db.query(Tag).filter(Tag.name.like(search))

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
            new_obj['no_posts'] = len(obj.posts)
            objs_list.append(new_obj)

        total_pages = math.ceil(count / limit)

        if page != 1 and page > total_pages:
            return ({'message': 'Page out of range'}, 404)

        return jsonify({'tags': objs_list, 'page': f'{page}',
             'total_pages': f"{total_pages}"}), 200


@app_views.route('/tags/<tag_id>/posts', methods=['GET'], strict_slashes=False)
@admin_required
@login_required
def tag_posts(tag_id=None):
    """
    **API endpoint for published articles associated with a tag**

    GET - returns all published articles associated with this tag
    """
    if request.method == 'GET':
        from api.v1.app import executor
        # return all articles associated with this tag
        # get page number
        page = request.args.get('page', type=int, default=1)
        # get limit number
        limit = request.args.get('limit', type=int, default=10)

        if page < 1 or limit < 1:
            return ({'message': 'Page number\
                     or limit should not be less than 1'}, 400)

        # calculate start and end
        start = limit * (page - 1)

        query = db.query(Post).join(Post.tags).filter(and_(Post.is_published == True, Tag.id == tag_id))

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

    
@app_views.route("/tags", methods=["POST"], strict_slashes=False)
@app_views.route("/tags/<tag_id>",
                 methods=["GET", "PATCH", "DELETE"], strict_slashes=False)
@login_required
@admin_required
@required_params(
    required={
        'name':"Tag must have a name."
    },
    validations=[
        ('tag', 'Tag already exists',
         verify_tag_available)
    ]
)
def tags(tag_id=None):
    """
    POST - creates a tag
    PUT - updates a tag
    DELETE - deletes a tag
    """
    allowed_attributes = [
        "name"
    ]

    if request.method == "POST":
        data = request.get_json()

        # check that all required attributes are present
        name = data.get('name').strip().lower()

        # create tag
        tag = Tag(name=name)
        try:
            tag.save()
        except IntegrityError:
            return jsonify({'message': 'Database integrity error'})

        msg = 'Tag created.'
        return jsonify({'message': msg, 'tag': tag.to_dict()}), 201

    if request.method == "PATCH":
        if not request.is_json:
            return jsonify({'message': 'Not a valid JSON'}), 400

        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'message': 'Not a valid JSON'}), 400

        if not data:
            return jsonify({'message': 'Empty dataset'}), 400

        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'message': f'Tag with id {tag_id} not found'}), 404

        for k, v in data.items():
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'message': f'Cannot update attribute - \
                    {k}'}), 400

            if len(v.strip()) == 0:
                return jsonify({'message': f'Missing {k}'}), 400
            # update attribute
            setattr(tag, k, v.strip())

        # save changes
        try:
            tag.save()
        except IntegrityError as f:
            return jsonify({'message': f'{f}'})

        msg = 'Tag updated successfully.'
        return jsonify({'message': msg, 'tag': tag.to_dict()}), 200

    if request.method == 'DELETE':
        # delete tag
        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'message': f'Tag with id {tag_id} not found'}), 404

        tag.delete()
        return jsonify({}), 200
