""" Contains filename functions """
import imghdr
import os

def allowed_file(file):
    """checks if a file is allowed"""
    from api.v1.app import app
    ext = os.path.splitext(file.filename)[1]
    return '.' in file.filename and \
        (ext == validate_image(file.stream) or \
         validate_image(file.stream) in app.config['ALLOWED_EXTENSIONS']) \
            and ext in app.config['ALLOWED_EXTENSIONS']


def validate_image(stream):
    header = stream.read(512)
    stream.seek(0)
    format = imghdr.what(None, header)
    if not format:
        return None
    return '.' + format
