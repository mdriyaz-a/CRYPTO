from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
import json
import os
from ciphers.classical import caesar_cipher, substitution_cipher, vigenere_cipher
from ciphers.modern import aes_encryption, aes_decryption, des3_encryption, des3_decryption
from ciphers.integrity import compute_hash, compute_mac, validate_mac
from models import db, User
from auth import auth_bp, init_mail
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for all routes

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
init_mail(mail)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    current_app.logger.warning(f"Expired token: {jwt_payload}")
    return jsonify({
        "error": "Token has expired",
        "message": "Please refresh your token or log in again"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    current_app.logger.warning(f"Invalid token: {error}")
    return jsonify({
        "error": "Invalid token",
        "message": "Signature verification failed"
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    current_app.logger.warning(f"Missing token: {error}")
    return jsonify({
        "error": "Authorization required",
        "message": "Request does not contain a valid token"
    }), 401

@jwt.token_verification_failed_loader
def verification_failed_callback():
    current_app.logger.warning("Token verification failed")
    return jsonify({
        "error": "Token verification failed",
        "message": "The token is invalid or has been tampered with"
    }), 401

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "Cryptography Learning Platform API is running"
    })

@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    plaintext = data.get('plaintext', '')
    method = data.get('method', '').lower()
    key = data.get('key', '')
    mode = data.get('mode', '')  # For AES: ECB, CBC, CTR
    
    if not plaintext:
        return jsonify({"error": "No plaintext provided"}), 400
    
    if not method:
        return jsonify({"error": "No encryption method specified"}), 400
    
    if not key and method != 'caesar':  # Caesar can use default shift
        return jsonify({"error": "No encryption key provided"}), 400
    
    try:
        result = {}
        
        # Classical ciphers
        if method == 'caesar':
            shift = int(key) if key else 3  # Default shift of 3
            ciphertext, steps = caesar_cipher(plaintext, shift, encrypt=True)
            result = {
                "ciphertext": ciphertext,
                "steps": steps
            }
        
        elif method == 'substitution':
            ciphertext, steps = substitution_cipher(plaintext, key, encrypt=True)
            result = {
                "ciphertext": ciphertext,
                "steps": steps
            }
        
        elif method == 'vigenere':
            ciphertext, steps = vigenere_cipher(plaintext, key, encrypt=True)
            result = {
                "ciphertext": ciphertext,
                "steps": steps
            }
        
        # Modern ciphers
        elif method == 'aes':
            if not mode:
                mode = 'cbc'  # Default to CBC mode if not specified

            ciphertext, iv, steps = aes_encryption(plaintext, key, mode)
            result = {
                "ciphertext": ciphertext,
                "iv": iv,
                "steps": steps
            }
        
        elif method == '3des':
            ciphertext, iv, steps = des3_encryption(plaintext, key)
            result = {
                "ciphertext": ciphertext,
                "iv": iv,
                "steps": steps
            }
        
        else:
            return jsonify({"error": f"Unsupported encryption method: {method}"}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/decrypt', methods=['POST'])
def decrypt():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    ciphertext = data.get('ciphertext', '')
    method = data.get('method', '').lower()
    key = data.get('key', '')
    mode = data.get('mode', '')  # For AES: ECB, CBC, CTR
    iv = data.get('iv', '')  # For AES CBC/CTR modes
    
    if not ciphertext:
        return jsonify({"error": "No ciphertext provided"}), 400
    
    if not method:
        return jsonify({"error": "No decryption method specified"}), 400
    
    if not key and method != 'caesar':  # Caesar can use default shift
        return jsonify({"error": "No decryption key provided"}), 400
    
    try:
        result = {}
        
        # Classical ciphers
        if method == 'caesar':
            shift = int(key) if key else 3  # Default shift of 3
            plaintext, steps = caesar_cipher(ciphertext, shift, encrypt=False)
            result = {
                "plaintext": plaintext,
                "steps": steps
            }
        
        elif method == 'substitution':
            plaintext, steps = substitution_cipher(ciphertext, key, encrypt=False)
            result = {
                "plaintext": plaintext,
                "steps": steps
            }
        
        elif method == 'vigenere':
            plaintext, steps = vigenere_cipher(ciphertext, key, encrypt=False)
            result = {
                "plaintext": plaintext,
                "steps": steps
            }
        
        # Modern ciphers
        elif method == 'aes':
            if not mode:
                mode = 'cbc'  # Default to CBC mode if not specified

            if mode in ['cbc', 'ctr'] and not iv:
                return jsonify({"error": f"IV required for AES {mode.upper()} mode"}), 400

            # Call the appropriate decryption function
            plaintext, steps = aes_decryption(ciphertext, key, mode, iv)
            result = {
                "plaintext": plaintext,
                "steps": steps
            }
        
        elif method == '3des':
            if not iv:
                return jsonify({"error": "IV required for 3DES decryption"}), 400

            plaintext, steps = des3_decryption(ciphertext, key, iv)
            result = {
                "plaintext": plaintext,
                "steps": steps
            }
        
        else:
            return jsonify({"error": f"Unsupported decryption method: {method}"}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    plaintext = data.get('plaintext', '')
    ciphertext = data.get('ciphertext', '')
    method = data.get('method', '').lower()
    key = data.get('key', '')
    mode = data.get('mode', '')  # For AES: ECB, CBC, CTR
    
    if not plaintext or not ciphertext:
        return jsonify({"error": "Both plaintext and ciphertext must be provided"}), 400
    
    if not method:
        return jsonify({"error": "No encryption method specified"}), 400
    
    if not key and method != 'caesar':
        return jsonify({"error": "No encryption key provided"}), 400
    
    try:
        # Encrypt the plaintext and check if it matches the provided ciphertext
        if method == 'caesar':
            shift = int(key) if key else 3
            encrypted, _ = caesar_cipher(plaintext, shift, encrypt=True)
        elif method == 'substitution':
            encrypted, _ = substitution_cipher(plaintext, key, encrypt=True)
        elif method == 'vigenere':
            encrypted, _ = vigenere_cipher(plaintext, key, encrypt=True)
        elif method == 'aes':
            if not mode:
                return jsonify({"error": "AES mode not specified (ECB, CBC, CTR)"}), 400
            
            # For simplicity, we're not checking the IV here
            encrypted, _, _ = aes_encryption(plaintext, key, mode)
        elif method == '3des':
            encrypted, _, _ = des3_encryption(plaintext, key)
        else:
            return jsonify({"error": f"Unsupported encryption method: {method}"}), 400
        
        # Compare the encrypted result with the provided ciphertext
        is_valid = encrypted == ciphertext
        
        return jsonify({
            "valid": is_valid,
            "expected": encrypted
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/hash', methods=['POST'])
def hash_message():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get('message', '')
    algorithm = data.get('algorithm', 'sha256').lower()

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Compute hash
        result = compute_hash(message, algorithm)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/mac', methods=['POST'])
def mac_message():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get('message', '')
    key = data.get('key', '')
    algorithm = data.get('algorithm', 'sha256').lower()

    if not message:
        return jsonify({"error": "No message provided"}), 400

    if not key:
        return jsonify({"error": "No key provided"}), 400

    try:
        # Compute MAC
        result = compute_mac(message, key, algorithm)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/validate-mac', methods=['POST'])
def validate_message_mac():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get('message', '')
    key = data.get('key', '')
    mac = data.get('mac', '')
    algorithm = data.get('algorithm', 'sha256').lower()

    if not message:
        return jsonify({"error": "No message provided"}), 400

    if not key:
        return jsonify({"error": "No key provided"}), 400

    if not mac:
        return jsonify({"error": "No MAC provided"}), 400

    try:
        # Validate MAC
        result = validate_mac(message, key, mac, algorithm)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create database tables when the app starts
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)