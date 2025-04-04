from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import pyotp
import qrcode
import base64
from io import BytesIO

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hashed_password = db.Column(db.String(128), nullable=False)

    # MFA settings
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_method = db.Column(db.String(20), default='none')  # 'none', 'totp', 'email'
    totp_secret = db.Column(db.String(32), nullable=True)
    email_otp = db.Column(db.String(6), nullable=True)
    email_otp_expiry = db.Column(db.DateTime, nullable=True)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.hashed_password = password  # Note: This is already hashed
        self.mfa_enabled = False
        self.mfa_method = 'none'
        self.totp_secret = None
        self.email_otp = None
        self.email_otp_expiry = None
    
    def generate_totp_secret(self):
        """Generate a new TOTP secret for the user"""
        self.totp_secret = pyotp.random_base32()
        return self.totp_secret
    
    def get_totp_uri(self):
        """Get the TOTP URI for QR code generation"""
        if not self.totp_secret:
            return None
        
        return pyotp.totp.TOTP(self.totp_secret).provisioning_uri(
            name=self.email,
            issuer_name="CryptoLearn"
        )
    
    def verify_totp(self, token):
        """Verify a TOTP token"""
        if not self.totp_secret:
            print(f"No TOTP secret for user {self.id}")
            return False

        try:
            totp = pyotp.TOTP(self.totp_secret)
            result = totp.verify(token)
            print(f"TOTP verification for user {self.id}: {result}")

            # For debugging, also check current valid token
            current_token = totp.now()
            print(f"Current valid TOTP token for user {self.id}: {current_token}")
            print(f"Provided token: {token}")

            return result
        except Exception as e:
            print(f"Error verifying TOTP for user {self.id}: {str(e)}")
            return False
    
    def generate_qr_code(self):
        """Generate a QR code for TOTP setup"""
        if not self.totp_secret:
            print(f"No TOTP secret for user {self.id}")
            return None

        try:
            uri = self.get_totp_uri()
            print(f"Generated TOTP URI for user {self.id}: {uri}")

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(uri)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()

            data_uri = f"data:image/png;base64,{img_str}"
            print(f"Generated QR code for user {self.id}, length: {len(data_uri)}")
            return data_uri
        except Exception as e:
            print(f"Error generating QR code for user {self.id}: {str(e)}")
            return None
    
    def to_dict(self, include_secrets=False):
        """Convert user object to dictionary for API responses"""
        result = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'mfa_enabled': self.mfa_enabled,
            'mfa_method': self.mfa_method
        }

        # Include TOTP secret if requested (for setup purposes only)
        if include_secrets and self.totp_secret:
            result['totp_secret'] = self.totp_secret

        return result


# We'll use the User model for email OTP since it's already in the users table
# No need for a separate EmailOTP model