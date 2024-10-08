"""WeBlog Flask Application"""
from api.v1.views import app_views
from dotenv import load_dotenv, find_dotenv
from flask import Flask, g, jsonify, render_template
from flask.sessions import SecureCookieSessionInterface
from flask_login import LoginManager, user_loaded_from_request
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from flask_executor import Executor
from models.user import User
from os import getenv
from utils import db


dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

app = Flask(__name__,
            static_folder="../../frontend/dist/assets",
            template_folder="../../frontend/dist")

app.config['SECRET_KEY'] = getenv('SECRET_KEY')
app.config['SECURITY_PASSWORD_SALT'] = getenv('SECURITY_PASSWORD_SALT')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['SESSION_COOKIE_HTTPONLY'] = True,
app.config['REMEMBER_COOKIE_HTTPONLY'] = True,
# app.config['SESSION_COOKIE_SAMESITE'] = "Strict",
app.config['ALLOWED_EXTENSIONS'] = ['.png', '.jpg', '.jpeg', '.gif']
app.config['UPLOAD_FOLDER'] = getenv('UPLOAD_FOLDER')
app.config['MAIL_DEFAULT_SENDER'] = getenv('MAIL_DEFAULT_SENDER')
app.config['MAIL_PASSWORD'] = getenv('MAIL_PASSWORD')


login_manager = LoginManager()
login_manager.init_app(app=app)
app.register_blueprint(app_views)

executor = Executor(app=app)
cors = CORS(app,
            resources={r"/api/v1/*": {"origins": "*"}},
            supports_credentials=True)
csrf = CSRFProtect(app=app)


# disable setting of Flask's Session cookie
@user_loaded_from_request.connect
def user_loaded_from_request(app, user=None):
    """
    sets the login_via_request variable to true
    """
    g.login_via_request = True


class CustomSessionInterface(SecureCookieSessionInterface):
    """Prevent creating session from API requests."""
    def save_session(self, *args, **kwargs):
        if g.get('login_via_request'):
            return
        return super(CustomSessionInterface, self).save_session(*args,
                                                                **kwargs)


app.session_interface = CustomSessionInterface()


@login_manager.user_loader
def load_user(user_id):
    """Loads a user from session using the user's id"""
    return db.query(User).filter(User.id == user_id).first()


@login_manager.unauthorized_handler
def null_user():
    """Returns null"""
    return jsonify({'user': None,
                    'status': 'user not authenticated'}), 401


@app.teardown_appcontext
def close_db(_):
    """ Close Storage """
    db.close()


@app.errorhandler(400)
def bad_request(e):
    """Handle the 400 page"""
    return jsonify({"message": f"{e}"}), 400


@app.errorhandler(404)
def not_found(e):
    """Handle the 404 page"""
    return jsonify({"message": f"{e}"}), 404


@app.errorhandler(401)
def unauthorized(_):
    """Handle the 401 page"""
    return jsonify({"message": "User unauthorized"}), 401


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def home(path):
    return render_template("index.html")


if __name__ == "__main__":
    """Starts the API"""
    with app.app_context():
        app.run(threaded=True, debug=getenv("DEBUG", False))
