# WeBlog - A Modern Blog Platform

## Setup .env file
To be able to run the flask app, create a .env file and add the following
```
export SECRET_KEY=<your_secret_key> # just generate a random string
export DEBUG=True
export APP_SETTINGS=config.DevelopmentConfig
export FLASK_DEBUG=1
export WEBLOG_DEV=<admin>
export WEBLOG_DEV_PWD=<password>
export WEBLOG_DB=weblog
export WEBLOG_HOST=localhost
export WEBLOG_ENV=development
export SECURITY_PASSWORD_SALT=<your_secret_key> # just generate a random string
export MAIL_DEFAULT_SENDER=example@gmail.com
export MAIL_PASSWORD=<gmail_password> # create app password on gmail
export MAIL_USERNAME=example@gmail.com # must be gmail

```

## Run the app
```
python3 -m flask --app api.v1.app run
```
