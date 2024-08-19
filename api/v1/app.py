"""WeBlog Flask Application"""
from api.v1.views import app_views
from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify
from flask_login import LoginManager # for managing authentication
# from flask_mail import Mail
from flask_cors import CORS
from models.user import User
from utils import db
from os import getenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

app = Flask(__name__)
app.config['SECRET_KEY'] = getenv('SECRET_KEY')
app.config['SECURITY_PASSWORD_SALT'] = getenv('SECURITY_PASSWORD_SALT')
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

cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

@login_manager.user_loader
def load_user(user_id):
    """Loads a user from session using the user's id"""
    return db.query(User).filter(User.id == user_id).first()

@app.teardown_appcontext
def close_db(_):
    """ Close Storage """
    db.close()


@app.errorhandler(404)
def not_found(_):
    """Handle the 404 page"""
    return jsonify({"error": "Not found"}), 404

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>\n"


if __name__ == "__main__":
    """Starts the API"""
    with app.app_context():
        app.run(threaded=True, debug=getenv("DEBUG", False))