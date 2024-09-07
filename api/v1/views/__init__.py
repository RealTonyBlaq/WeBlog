""" Contains the Blueprint for the API """
from flask import Blueprint, request
from flask_login import login_required
from functools import wraps
from utils.uploads import allowed_file
from werkzeug.utils import secure_filename
import os


app_views = Blueprint("app_views", __name__, url_prefix="/api/v1")


def admin_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if current_user.is_admin:
            return f(*args, **kwargs)
        else:
            msg = "You need to be an admin to perform this action."
            return jsonify({'message': msg}), 403

    return wrap


@app_views.route('/image_uploads/<type>', methods=['POST'],
                 strict_slashes=False)
# @login_required
def upload_avatar(type):
    """
    stores an image and returns the url
    """
    if type != 'avatars' and type != 'headers':
        return jsonify({'message': "type must be 'avatars' or 'headers'"}), 400
    if 'file' not in request.files:
        return jsonify({'message': 'No file selected'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == "":
        return jsonify({'message': 'No file selected'}), 400

    if uploaded_file and allowed_file(uploaded_file):
        filename = secure_filename(uploaded_file.filename)
        path = os.path.join(f"assets/{type}", filename)
        absolute_path = os.path.join("frontend/dist", path)
        try:
            uploaded_file.save(absolute_path)
        except Exception as e:
            return jsonify({'message': f"Error - {e}"}), 400
        return jsonify({'message': 'File saved successfully',
                        'url': path}), 201
    return jsonify({'message': "Error - Bad Request"}), 400


from api.v1.views.authentication import *
from api.v1.views.me import *
from api.v1.views.tags import *
from api.v1.views.comment import *
from api.v1.views.posts import *
from api.v1.views.users import *
