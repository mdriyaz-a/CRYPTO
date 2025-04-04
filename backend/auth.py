from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask_mail import Message
from models import db, User
from flask_bcrypt import Bcrypt
import random
import string
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()
mail = None  # Will be initialized in app.py

def init_mail(mail_instance):
    global mail
    mail = mail_instance

def generate_otp(length=6):
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(user, otp):
    """Send OTP to user's email"""
    if not mail:
        current_app.logger.error("Mail not initialized")
        if current_app.config['DEBUG']:
            current_app.logger.info(f"[DEV MODE] Mail not initialized, but proceeding. OTP for {user.email}: {otp}")
            return True
        return False

    # Always log the OTP in debug mode for testing purposes
    if current_app.config['DEBUG']:
        current_app.logger.info(f"[DEV MODE] OTP for {user.email}: {otp}")
        # In development mode, don't even try to send the email to avoid timeouts
        return True

    # Only attempt to send emails in production mode
    try:
        msg = Message(
            subject="Your CryptoLearn Verification Code",
            recipients=[user.email],
            html=f"""
            <h1>CryptoLearn Authentication</h1>
            <p>Hello {user.username},</p>
            <p>Your verification code is: <strong>{otp}</strong></p>
            <p>This code will expire in {current_app.config['OTP_EXPIRY_MINUTES']} minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return False

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        mfa_method = data.get('mfa_method', 'none')

        # Validate input
        if not username or not email or not password:
            return jsonify({"error": "Username, email, and password are required"}), 400

        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 409

        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create new user with hashed password
        user = User(username=username, email=email, password=hashed_password)

        # Setup MFA if requested
        if mfa_method in ['totp', 'email']:
            user.mfa_enabled = True
            user.mfa_method = mfa_method

            if mfa_method == 'totp':
                user.generate_totp_secret()

        db.session.add(user)
        db.session.commit()

        result = {
            "message": "User registered successfully",
            "user": user.to_dict()
        }

        # If TOTP is enabled, include QR code
        if user.mfa_method == 'totp':
            result["totp_secret"] = user.totp_secret
            result["qr_code"] = user.generate_qr_code()

        return jsonify(result), 201
    except Exception as e:
        current_app.logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    username_or_email = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username_or_email or not password:
        return jsonify({"error": "Username/email and password are required"}), 400
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    
    if not user or not bcrypt.check_password_hash(user.hashed_password, password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Check if MFA is enabled
    if user.mfa_enabled:
        if user.mfa_method == 'totp':
            # For TOTP, return that MFA is required
            return jsonify({
                "message": "MFA required",
                "mfa_method": "totp",
                "user_id": user.id
            }), 200
        
        elif user.mfa_method == 'email':
            # For Email OTP, generate and send OTP
            otp = generate_otp()

            # Store OTP directly in the user model
            user.email_otp = otp
            user.email_otp_expiry = datetime.utcnow() + timedelta(minutes=current_app.config['OTP_EXPIRY_MINUTES'])

            db.session.commit()

            # Send OTP email - in debug mode this will just log the OTP
            email_sent = send_otp_email(user, otp)

            # In development mode, always proceed
            if email_sent or current_app.config['DEBUG']:
                # Always log the OTP in debug mode
                if current_app.config['DEBUG']:
                    current_app.logger.info(f"[DEBUG] Email OTP for {user.email}: {otp}")

                return jsonify({
                    "message": "MFA required",
                    "mfa_method": "email",
                    "user_id": user.id,
                    # Always include the OTP in debug mode for testing
                    "debug_otp": otp if current_app.config['DEBUG'] else None
                }), 200
            else:
                return jsonify({"error": "Failed to send OTP email"}), 500
    
    # If MFA is not enabled, generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    # Log the tokens for debugging
    current_app.logger.info(f"Generated access token for user {user.id}: {access_token[:10]}...")
    current_app.logger.info(f"Generated refresh token for user {user.id}: {refresh_token[:10]}...")

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/verify-totp', methods=['POST'])
def verify_totp():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_id = data.get('user_id')
    totp_code = data.get('totp_code', '').strip()

    if not user_id or not totp_code:
        return jsonify({"error": "User ID and TOTP code are required"}), 400

    # Convert user_id to int if it's a string
    if isinstance(user_id, str) and user_id.isdigit():
        user_id = int(user_id)

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # For account setup, we need to allow verification even if MFA is not fully enabled yet
    if user.totp_secret is None:
        return jsonify({"error": "TOTP not set up for this user"}), 400

    # Log the verification attempt
    current_app.logger.info(f"Verifying TOTP code for user {user.id}: {totp_code}")
    current_app.logger.info(f"User TOTP secret: {user.totp_secret}")

    if user.verify_totp(totp_code):
        # If this is a login verification, generate tokens
        if request.args.get('login') == 'true' or data.get('login') == True:
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            return jsonify({
                "message": "TOTP verification successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user.to_dict()
            }), 200
        # Otherwise just return success for setup verification
        else:
            return jsonify({
                "message": "TOTP verification successful",
                "verified": True
            }), 200
    else:
        return jsonify({"error": "Invalid TOTP code"}), 401

@auth_bp.route('/verify-email-otp', methods=['POST'])
def verify_email_otp():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id')
    otp = data.get('otp', '').strip()
    
    if not user_id or not otp:
        return jsonify({"error": "User ID and OTP are required"}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if not user.mfa_enabled or user.mfa_method != 'email':
        return jsonify({"error": "Email OTP MFA not enabled for this user"}), 400
    
    # Check if OTP exists and is valid
    if not user.email_otp:
        return jsonify({"error": "No OTP found for this user"}), 404

    if not user.email_otp_expiry or datetime.utcnow() > user.email_otp_expiry:
        return jsonify({"error": "OTP has expired"}), 401

    if user.email_otp != otp:
        return jsonify({"error": "Invalid OTP"}), 401

    # OTP is valid, clear it and generate tokens
    user.email_otp = None
    user.email_otp_expiry = None
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        "message": "Email OTP verification successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/account', methods=['GET'])
@jwt_required()
def get_account():
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"Getting account for user_id: {user_id}")

        # Convert user_id to int if it's a string
        if isinstance(user_id, str) and user_id.isdigit():
            user_id = int(user_id)

        user = User.query.get(user_id)

        if not user:
            current_app.logger.error(f"User not found for ID: {user_id}")
            return jsonify({"error": "User not found"}), 404

        result = user.to_dict()

        # If TOTP is enabled, include QR code for display
        if user.mfa_method == 'totp':
            result["qr_code"] = user.generate_qr_code()

        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error in get_account: {str(e)}")
        return jsonify({"error": f"Failed to get account: {str(e)}"}), 500

@auth_bp.route('/account/update', methods=['PUT'])
@jwt_required()
def update_account():
    user_id = get_jwt_identity()

    # Convert user_id to int if it's a string
    if isinstance(user_id, str) and user_id.isdigit():
        user_id = int(user_id)

    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Update username if provided
    if 'username' in data and data['username'].strip():
        new_username = data['username'].strip()
        
        # Check if username already exists
        existing_user = User.query.filter_by(username=new_username).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Username already exists"}), 409
        
        user.username = new_username
    
    # Update email if provided
    if 'email' in data and data['email'].strip():
        new_email = data['email'].strip()
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Email already exists"}), 409
        
        user.email = new_email
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Update MFA settings if provided
    if 'mfa_enabled' in data:
        mfa_enabled = bool(data['mfa_enabled'])

        # If disabling MFA, reset method to 'none'
        if not mfa_enabled:
            user.mfa_enabled = False
            user.mfa_method = 'none'
            user.totp_secret = None
            current_app.logger.info(f"User {user.id} disabled MFA")
        else:
            # If enabling MFA, make sure a method is selected
            if user.mfa_method == 'none' and 'mfa_method' not in data:
                # Default to email if no method is specified
                user.mfa_method = 'email'
            user.mfa_enabled = True
            current_app.logger.info(f"User {user.id} enabled MFA with method {user.mfa_method}")

    # Update MFA method if provided
    if 'mfa_method' in data and data['mfa_method'] in ['none', 'totp', 'email']:
        old_method = user.mfa_method
        new_method = data['mfa_method']

        # If changing to a different method
        if old_method != new_method:
            user.mfa_method = new_method
            current_app.logger.info(f"User {user.id} changed MFA method from {old_method} to {new_method}")

            # If enabling TOTP, generate a new secret
            if new_method == 'totp':
                user.mfa_enabled = True
                user.generate_totp_secret()
                current_app.logger.info(f"Generated new TOTP secret for user {user.id}")

            # If enabling email OTP
            elif new_method == 'email':
                user.mfa_enabled = True
                user.totp_secret = None

            # If disabling MFA
            elif new_method == 'none':
                user.mfa_enabled = False
                user.totp_secret = None
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    result = user.to_dict()
    
    # If TOTP is enabled, include QR code and secret for display
    if user.mfa_method == 'totp':
        # Always include the TOTP secret for manual entry
        result["totp_secret"] = user.totp_secret
        current_app.logger.info(f"TOTP secret for user {user.id}: {user.totp_secret}")

        # Also include QR code if possible
        qr_code = user.generate_qr_code()
        if qr_code:
            result["qr_code"] = qr_code
            current_app.logger.info(f"Generated QR code for user {user.id}, length: {len(qr_code)}")
        else:
            current_app.logger.error(f"Failed to generate QR code for user {user.id}")
    
    return jsonify({
        "message": "Account updated successfully",
        "user": result
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        # Get the JWT identity
        user_id = get_jwt_identity()
        current_app.logger.info(f"Refreshing token for user_id: {user_id}")

        # Get the authorization header
        auth_header = request.headers.get('Authorization', '')
        current_app.logger.info(f"Auth header: {auth_header}")

        # Convert user_id to int if it's a string
        if isinstance(user_id, str) and user_id.isdigit():
            user_id = int(user_id)

        # Find the user
        user = User.query.get(user_id)
        if not user:
            current_app.logger.error(f"User not found for ID: {user_id} during token refresh")
            return jsonify({"error": "User not found"}), 404

        # Create a new access token
        access_token = create_access_token(identity=str(user_id))
        current_app.logger.info(f"New access token created for user {user_id}")

        return jsonify({
            "message": "Token refreshed",
            "access_token": access_token,
            "refresh_token": request.headers.get('Authorization', '').replace('Bearer ', ''),
            "user": user.to_dict()
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error in refresh token: {str(e)}")
        return jsonify({"error": f"Failed to refresh token: {str(e)}"}), 500