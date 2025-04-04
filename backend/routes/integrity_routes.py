from flask import Blueprint, request, jsonify
from ciphers.integrity import compute_hash, compute_mac, validate_mac

integrity_bp = Blueprint('integrity', __name__)

@integrity_bp.route('/hash', methods=['POST'])
def hash_route():
    """
    Compute a hash of the input message.
    
    Request JSON:
    {
        "message": "Message to hash",
        "algorithm": "sha256" (optional, default: sha256)
    }
    """
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    message = data['message']
    algorithm = data.get('algorithm', 'sha256')
    
    try:
        result = compute_hash(message, algorithm)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@integrity_bp.route('/mac', methods=['POST'])
def mac_route():
    """
    Compute a MAC of the input message.
    
    Request JSON:
    {
        "message": "Message to authenticate",
        "key": "Secret key",
        "algorithm": "sha256" (optional, default: sha256)
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Request data is required'}), 400
    
    if 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    if 'key' not in data:
        return jsonify({'error': 'Key is required'}), 400
    
    message = data['message']
    key = data['key']
    algorithm = data.get('algorithm', 'sha256')
    
    try:
        result = compute_mac(message, key, algorithm)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@integrity_bp.route('/validate-mac', methods=['POST'])
def validate_mac_route():
    """
    Validate a MAC against a message and key.
    
    Request JSON:
    {
        "message": "Message to authenticate",
        "key": "Secret key",
        "mac": "MAC to validate",
        "algorithm": "sha256" (optional, default: sha256)
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Request data is required'}), 400
    
    if 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    if 'key' not in data:
        return jsonify({'error': 'Key is required'}), 400
    
    if 'mac' not in data:
        return jsonify({'error': 'MAC is required'}), 400
    
    message = data['message']
    key = data['key']
    mac = data['mac']
    algorithm = data.get('algorithm', 'sha256')
    
    try:
        result = validate_mac(message, key, mac, algorithm)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500