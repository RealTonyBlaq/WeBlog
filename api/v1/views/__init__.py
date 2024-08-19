""" Contains the Blueprint for the API """
from flask import Blueprint, request

app_views = Blueprint("app_views", __name__, url_prefix="/api/v1")

from api.v1.views.authentication import *
