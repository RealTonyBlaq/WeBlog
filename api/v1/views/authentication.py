"""Defines the Authentication routes"""
from api.v1.views import app_views
from datetime import datetime
from bcrypt import gensalt, hashpw, checkpw
from flask import (jsonify, request, redirect,
                   url_for, flash, render_template, session)
from flask_login import login_user, logout_user, current_user
from models.user import User
from sqlalchemy.exc import IntegrityError
from utils import db
from utils.token import generate_confirmation_token, confirm_token
from utils.send_email import send_confirmation_email
# from verify_email import verify_email
from werkzeug.exceptions import BadRequest


@app_views.route("/signup", methods=["POST"], strict_slashes=False)
def signup():
    """
    Registers a user on the database
    """
    if not request.is_json:
        return jsonify({'message': 'Not a valid JSON'}), 400

    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({'message': 'Not a valid JSON'}), 400

    if not data:
        return jsonify({'message': 'Empty dataset'}), 400

    # check that all required attributes are present
    email = data.get('email').strip()
    password = data.get('password').strip()
    confirm_password = data.get('confirm_password').strip()
    first_name = data.get('first_name').strip()
    last_name = data.get('last_name').strip()

    if not email or len(email) == 0:
        return jsonify({'message': 'Missing email'}), 400
    # check that email is valid
    # if not await verify_email(email):
    #     return jsonify({'message': 'Invalid email'}), 400

    if not password or len(password) == 0:
        return jsonify({'message': 'Missing password'}), 400
    if not confirm_password or len(confirm_password) == 0:
        return jsonify({'message': 'Missing confirm_password'}), 400
    # check that password and confirm_password match
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    if not first_name or len(first_name) == 0:
        return jsonify({'message': 'Missing first_name'}), 400
    if not last_name or len(last_name) == 0:
        return jsonify({'message': 'Missing last_name'}), 400

    # check that email is not already in use
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return jsonify({'message': 'Email already in use'}), 400

    # hash users password
    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    # create user
    user = User(
        email=email, password=hashed_password,
        first_name=first_name, last_name=last_name
    )
    try:
        db.add(user)
        db.save()
    except IntegrityError:
        return jsonify({'message': 'Database integrity error'})

    # send user confirmation email
    token = generate_confirmation_token(email)
    confirm_url = url_for('app_views.confirm_email',
                          token=token, _external=True)
    content = f"""Dear {user.first_name} {user.last_name},

        Thank you for registering with WeBlog! To complete your \
        registration, please verify your email address by clicking the \
        button below:

        <div style="justify-content: space-around; display: flex;">

        <a href="{confirm_url}" style="display: inline-block; padding: \
        10px 20px; background-color: #007bff; color: #fff; text-decoration: \
        none; border-radius: 5px; position: absolute;">Verify Your Account</a>

        </div>

        If you're unable to click the button, you can copy and paste the \
        following link into your browser:
        {confirm_url}

        By verifying your email address, you'll gain access to all the \
        features of WeBlog.

        If you did not register for an account with WeBlog, \
        please ignore this email.

        Thank you for joining our community!

        Best regards,
        The WeBlog Team"""
    subject = "WeBlog - Welcome | Email Confirmation"
    send_confirmation_email(user.email, subject, content)

    msg = 'Signup successful, please verify email to proceed.'
    return jsonify({'message': msg}), 201


@app_views.route("/login", methods=["POST"], strict_slashes=False)
def login():
    """
    Authenticates a user on the database
    """
    if not request.is_json:
        return jsonify({'message': 'Not a valid JSON'}), 400

    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({'message': 'Not a valid JSON'}), 400

    if not data:
        return jsonify({'message': 'Empty dataset'}), 400
    # check that all required attributes are present

    email = data.get('email').strip()
    password = data.get('password').strip()

    if not email or len(email) == 0:
        return jsonify({'message': 'Missing email'}), 400

    if not password or len(password) == 0:
        return jsonify({'message': 'Missing password'}), 400

    # check db for email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    # check that passwords match
    if checkpw(password.encode('utf-8'),
               user.password.encode('utf-8')):
        # create a session
        if login_user(user=user):
            # redirect user to home page
            # return redirect('/')
            user_dict = current_user.to_dict()
            user_dict['tags'] = [tag.id for tag in
                                 current_user.interested_subjects]
            user_dict['bookmarks'] = [post.id for post in
                                      current_user.bookmarks]
            user_dict['articles'] = [post.to_dict() for post in
                                     current_user.articles]
            user_dict['liked_articles'] = [post.to_dict() for post in
                                     current_user.liked_articles]
            user_dict['liked_comments'] = [comment.id for comment in current_user.liked_comments]
            # Updates last_login time
            user.last_login = datetime.now()
            # sets is_logged_in to be True. This could help
            # determine the number of ONLINE users
            user.is_logged_in = True
            user.save()
            return jsonify({'message': 'success', 'user': user_dict}), 200
        return jsonify({'message': 'Please complete email verification'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@app_views.route('/logout', methods=['POST'], strict_slashes=False)
def logout():
    """Logs out a user from the session"""
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not logged in'}), 401

    current_user.is_logged_in = False
    current_user.save()
    logout_user()
    # Clears all session cookies for the user
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


@app_views.route('/email_confirmation/<token>', strict_slashes=False)
def confirm_email(token):
    """Confirms a user's email"""
    if current_user.is_authenticated:
        flash('User already logged in.', 'logged in')
        return render_template("email_confirmation.html")

    email = confirm_token(token)
    if not email:
        # add option to resend confirmation link in case it has expired
        flash('The confirmation link is invalid or has expired.', 'expired')
        return render_template("email_confirmation.html")

    # check db for email
    user = db.query(User).filter(User.email == email).first()
    # check if user is already verified
    if user.is_email_verified:
        flash('Account already confirmed. Please login.', 'already verified')
        return render_template("email_confirmation.html")

    # set user's email verification to True
    user.is_email_verified = True
    user.save()

    # redirect user to login or automatically log user in
    flash('Email verification successfull', 'success')
    return render_template("email_confirmation.html")


@app_views.route('/forgot_password', methods=['POST'], strict_slashes=False)
def send_password_reset_mail():
    """Sends a password reset email"""
    if current_user.is_authenticated:
        return jsonify({'message': 'User logged in'}), 400

    if not request.is_json:
        return jsonify({'message': 'Not a valid JSON'}), 400

    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({'message': 'Not a valid JSON'}), 400

    if not data:
        return jsonify({'message': 'Empty dataset'}), 400

    email = data.get('email').strip()

    if not email or len(email) == 0:
        return jsonify({'message': 'Missing email'}), 400

    # check db for email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return jsonify({'message': f'User with {email} does not exist'}), 404

    # send reset email
    base_url = url_for('home', _external=True)
    route_url = f'reset_password/{user.generate_reset_password_token()}/{user.id}'
    reset_url = base_url + route_url
    content = f"""Dear {user.first_name} {user.last_name},

        You are receiving this email because you requested a password reset. \
            Reset your password by clicking the button below:

        <div style="justify-content: space-around; display: flex;">

        <a href="{reset_url}" style="display: inline-block; padding: \
        10px 20px; background-color: #007bff; color: #fff; text-decoration: \
        none; border-radius: 5px; position: absolute;">Reset Your Password</a>

        </div>

        If you're unable to click the button, you can copy and paste the \
        following link into your browser:
        {reset_url}

        If you did not ask for a password reset, please ignore this email and\
            contact someone from the development team.

        Best regards,
        The WeBlog Team"""
    subject = "WeBlog - Password Reset"
    send_confirmation_email(user.email, subject, content)

    msg = 'Link to reset password has been sent to your email.'
    return jsonify({'message': msg}), 200


@app_views.route('/reset_password/<token>/<user_id>', methods=['POST'],
                 strict_slashes=False)
def reset_password(token, user_id):
    """Resets a user's password"""
    if current_user.is_authenticated:
        return redirect('/')

    if not request.is_json:
        return jsonify({'message': 'Not a valid JSON'}), 400

    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({'message': 'Not a valid JSON'}), 400

    if not data:
        return jsonify({'message': 'Empty dataset'}), 400

    password = data.get('password').strip()
    confirm_password = data.get('confirm_password').strip()

    if not password or len(password) == 0:
        return jsonify({'message': 'Missing password'}), 400
    if not confirm_password or len(confirm_password) == 0:
        return jsonify({'message': 'Missing confirm_password'}), 400

    user = User.validate_reset_password_token(token, user_id)
    if not user:
        return jsonify({'message': 'The reset link is invalid or \
            has expired.'}), 404

    # set user's password to new password
    # check that password and confirm_password match
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400
    # hash users password
    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    user.password = hashed_password
    user.save()

    # redirect user to login or automatically log user in
    msg = 'Password successfully updated.'
    return jsonify({'message': msg}), 200


@app_views.route("/resend_conf_email", methods=["POST"], strict_slashes=False)
def resend_conf_email():
    """Resends a confirmation email"""
    if current_user.is_authenticated:
        return redirect('/')

    if not request.is_json:
        return jsonify({'message': 'Not a valid JSON'}), 400

    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({'message': 'Not a valid JSON'}), 400

    if not data:
        return jsonify({'message': 'Empty dataset'}), 400

    # check that all required attributes are present
    email = data.get('email').strip()

    if not email or len(email) == 0:
        return jsonify({'message': 'Missing email'}), 400

    # get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return jsonify({'message': f'User with email-{email} \
            not found'}), 404

    if user.is_email_verified:
        return jsonify({'message': f'User with email-{email} \
            already verified'}), 401

    # send user confirmation email
    token = generate_confirmation_token(email)
    confirm_url = url_for('app_views.confirm_email',
                          token=token, _external=True)
    content = f"""Dear {user.first_name} {user.last_name},

        Thank you for registering with WeBlog! To complete your \
        registration, please verify your email address by clicking the \
        button below:

        <div style="justify-content: space-around; display: flex;">

        <a href="{confirm_url}" style="display: inline-block; padding: \
        10px 20px; background-color: #007bff; color: #fff; text-decoration: \
        none; border-radius: 5px; position: absolute;">Verify Your Account</a>

        </div>

        If you're unable to click the button, you can copy and paste the \
        following link into your browser:
        {confirm_url}

        By verifying your email address, you'll gain access to all the \
        features of WeBlog.

        If you did not register for an account with WeBlog, \
        please ignore this email.

        Thank you for joining our community!

        Best regards,
        The WeBlog Team"""
    subject = "WeBlog - Email Confirmation"
    send_confirmation_email(user.email, subject, content)

    msg = 'Email verification hasb been sent, please verify email to proceed.'
    return jsonify({'message': msg}), 200
