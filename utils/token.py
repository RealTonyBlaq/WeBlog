""" Email Confirmation module """
from itsdangerous import URLSafeTimedSerializer


def generate_confirmation_token(email):
    """Generates a confirmation token"""
    from api.v1.app import app
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])


def confirm_token(token, expiration=86400):
    """confirms a token"""
    from api.v1.app import app
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token, salt=app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except:
        return False
    return email
