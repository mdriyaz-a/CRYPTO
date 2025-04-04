from flask import Flask
from flask_mail import Mail, Message
import random

app = Flask(__name__)

# Update the configuration with your actual SMTP details.
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'riyaz960088@gmail.com'
app.config['MAIL_PASSWORD'] = 'uuxr jdzw kqnj gprs'  # Use an app-specific password if 2FA is enabled
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

@app.route('/send-otp')
def send_otp():
    otp = random.randint(100000, 999999)
    msg = Message(
        subject="Your One-Time Password (OTP)",
        sender=app.config['MAIL_USERNAME'],
        recipients=["mohamedriyaz@karunya.edu.in"]
    )
    msg.body = f"Your OTP is: {otp}. It is valid for 5 minutes."
    mail.send(msg)
    return f"OTP sent successfully! (OTP: {otp})"

if __name__ == "__main__":
    app.run(debug=True)
