""" Contains the Blueprint for the API """
from flask import Blueprint, request
from functools import wraps

app_views = Blueprint("app_views", __name__, url_prefix="/api/v1")

def admin_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if current_user.is_admin:
            return f(*args, **kwargs)
        else:
            msg = "You need to be an admin to perform this action."
            return jsonify({'error': msg}), 403

    return wrap

from api.v1.views.authentication import *
from api.v1.views.me import *
from api.v1.views.tags import *
from api.v1.views.comment import *
from api.v1.views.posts import *
