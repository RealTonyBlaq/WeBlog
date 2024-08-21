"""Defines the Tag routes"""
from api.v1.views import app_views, admin_required
from flask import jsonify, request
from flask_login import login_required
from models.tag import Tag
from sqlalchemy.exc import IntegrityError
from utils import db
from utils.get_all import get_model_instances
from werkzeug.exceptions import BadRequest


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
                return jsonify({'error': f'tag with id-{tag_id} not found'}), 404
            return jsonify({'tag': tag.to_dict()}), 200

        # get all tags
        response, code =  get_model_instances(Tag)
        return jsonify(response), code


@app_views.route("/tags", methods=["POST"], strict_slashes=False)
@app_views.route("/tags/<tag_id>", methods=["GET", "PATCH", "DELETE"], strict_slashes=False)
@login_required
@admin_required
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
        if not request.is_json:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'error': 'Not a valid JSON'}), 400

        if not data:
                return jsonify({'error': 'Empty dataset'}), 400

        # check that all required attributes are present
        name = data.get('name').strip().lower()

        if not name:
            return jsonify({'error': 'Missing name'}), 400

        # check that tag does not exist already
        existing_tag = db.query(Tag).filter(Tag.name == name).first()
        if existing_tag:
            return jsonify({'error': 'Tag already exists'}), 400

        # create tag
        tag = Tag(name=name)
        try:
            db.add(tag)
            db.save()
        except IntegrityError:
            return jsonify({'error': 'Database integrity error'})

        msg = 'Tag created.'
        return jsonify({'sucess': msg, 'tag': tag.to_dict()}), 201

    if request.method == "PATCH":
        if not request.is_json:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        try:
            data = request.get_json()
        except BadRequest:
            return jsonify({'error': 'Not a valid JSON'}), 400
    
        if not data:
            return jsonify({'error': 'Empty dataset'}), 400
        
        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'error': f'Tag with id {tag_id} not found'}), 404

        for k, v in data.items():
            # make sure to only update attributes
            if k not in allowed_attributes:
                return jsonify({'error': f'Cannot update attribute - {k}'}), 400
                
            if len(v.strip()) == 0:
                return jsonify({'error': f'Missing {k}'}), 400
            # update attribute
            setattr(tag, k, v.strip())

        # save changes
        try:
            tag.save()
        except IntegrityError as f:
            return jsonify({'error': f'{f}'})

        msg = 'Tag updated successfully.'
        return jsonify({'sucess': msg, 'tag': tag.to_dict()}), 200
    
    if request.method == 'DELETE':
        # delete tag
        tag = db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return jsonify({'error': f'Tag with id {tag_id} not found'}), 404
        
        tag.delete()
        return jsonify({}), 200
