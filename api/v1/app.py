"""WeBlog Flask Application"""
from api.v1.views import app_views
from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify, request, abort, render_template
from flask_login import LoginManager # for managing authentication
from flask_login import login_required
from flask_cors import CORS
from flask_executor import Executor
from models.user import User
from os import getenv
from utils import db
from utils.uploads import allowed_file
from werkzeug.utils import secure_filename
import os

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

app = Flask(__name__)
app.config['SECRET_KEY'] = getenv('SECRET_KEY')
app.config['SECURITY_PASSWORD_SALT'] = getenv('SECURITY_PASSWORD_SALT')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif']
app.config['UPLOAD_FOLDER'] = getenv('UPLOAD_FOLDER')
# MAIL SERVER CONFIG
# app.config['MAIL_SERVER'] = 'live.smtp.mailtrap.io'
# app.config['MAIL_PORT'] = 587
app.config['MAIL_DEFAULT_SENDER'] = getenv('MAIL_DEFAULT_SENDER')
# app.config['MAIL_USERNAME'] = getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = getenv('MAIL_PASSWORD')
# app.config['MAIL_USE_TLS'] = True
# app.config['MAIL_USE_SSL'] = False


login_manager = LoginManager()
login_manager.init_app(app=app)
app.register_blueprint(app_views)

# mail = Mail(app=app)
executor = Executor(app=app)

cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

@login_manager.user_loader
def load_user(user_id):
    """Loads a user from session using the user's id"""
    return db.query(User).filter(User.id == user_id).first()


@app.route('/image_uploads/<type>', methods=['POST'], strict_slashes=False)
@login_required
def upload_avatar(type):
    """
    stores an image and returns the url
    """
    if type != 'avatars' or type != 'headers':
        abort(404)
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    uploaded_file = request.files['file']
    if uploaded_file.filename == "":
        return jsonify({'error': 'No file selected'}), 400
    
    if uploaded_file and allowed_file(uploaded_file.filename):
        filename = secure_filename(uploaded_file.filename)
        path = os.path.join(f"assets/{type}", filename)
        try:
            uploaded_file.save(path)
        except Exception as e:
            return jsonify({'error': e}), 400
        return jsonify({'success': 'File saved successfully', 'url': path}), 201
    abort(400)


@app.teardown_appcontext
def close_db(_):
    """ Close Storage """
    db.close()


@app.errorhandler(400)
def not_found(_):
    """Handle the 400 page"""
    return jsonify({"error": "Bad Request"}), 400


@app.errorhandler(404)
def not_found(_):
    """Handle the 404 page"""
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(401)
def unauthorized(_):
    """Handle the 401 page"""
    return jsonify({"error": "User unauthorized"}), 401


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def home(path):
    return render_template("index.html")


if __name__ == "__main__":
    """Starts the API"""
    with app.app_context():
        app.run(threaded=True, debug=getenv("DEBUG", False))