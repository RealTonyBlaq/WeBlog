""" Contains the send_confirmation_email function """
# from flask_mail import Message
import yagmail
import yagmail.error


def send_confirmation_email(to, subject, template):
    """sends a confirmation email"""
    from api.v1.app import app
    # msg = Message(
    #     subject=subject, recipients=[to],
    #     html=template, sender=app.config['MAIL_DEFAULT_SENDER']
    # )
    # mail.send(msg)
    yag = yagmail.SMTP(app.config['MAIL_DEFAULT_SENDER'], app.config['MAIL_PASSWORD'])

    try:
            # Send a test email
            yag.send(to=to, subject=subject, contents=template)

            # Close connection.
            yag.close()
            return True
    except yagmail.error.YagInvalidEmailAddress:
        return False
