import hashlib
import hmac
import base64
import binascii
import json
from typing import Dict, List, Tuple, Any, Optional

def compute_hash(message: str, algorithm: str = 'sha256') -> Dict[str, Any]:
    """
    Compute a hash of the input message using the specified algorithm.
    
    Args:
        message: The input message to hash
        algorithm: The hash algorithm to use (sha256, sha1, md5, etc.)
        
    Returns:
        Dictionary containing the hash result and visualization steps
    """
    # Convert message to bytes
    message_bytes = message.encode('utf-8')
    
    # Initialize hash object based on algorithm
    if algorithm == 'md5':
        hash_obj = hashlib.md5()
    elif algorithm == 'sha1':
        hash_obj = hashlib.sha1()
    elif algorithm == 'sha256':
        hash_obj = hashlib.sha256()
    elif algorithm == 'sha512':
        hash_obj = hashlib.sha512()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
    # Compute hash
    hash_obj.update(message_bytes)
    hash_result = hash_obj.hexdigest()
    
    # Generate visualization steps
    steps = generate_hash_steps(message, algorithm)
    
    return {
        "hash": hash_result,
        "algorithm": algorithm,
        "message": message,
        "message_hex": message_bytes.hex(),
        "steps": steps
    }

def compute_mac(message: str, key: str, algorithm: str = 'sha256') -> Dict[str, Any]:
    """
    Compute an HMAC of the input message using the specified key and algorithm.
    
    Args:
        message: The input message
        key: The secret key
        algorithm: The hash algorithm to use (sha256, sha1, md5, etc.)
        
    Returns:
        Dictionary containing the HMAC result and visualization steps
    """
    # Convert message and key to bytes
    message_bytes = message.encode('utf-8')
    key_bytes = key.encode('utf-8')
    
    # Determine the hash algorithm
    if algorithm == 'md5':
        hash_func = hashlib.md5
    elif algorithm == 'sha1':
        hash_func = hashlib.sha1
    elif algorithm == 'sha256':
        hash_func = hashlib.sha256
    elif algorithm == 'sha512':
        hash_func = hashlib.sha512
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
    # Compute HMAC
    hmac_obj = hmac.new(key_bytes, message_bytes, hash_func)
    hmac_result = hmac_obj.hexdigest()
    
    # Generate visualization steps
    steps = generate_hmac_steps(message, key, algorithm)
    
    return {
        "hmac": hmac_result,
        "algorithm": algorithm,
        "message": message,
        "key": key,
        "message_hex": message_bytes.hex(),
        "key_hex": key_bytes.hex(),
        "steps": steps
    }

def validate_mac(message: str, key: str, mac: str, algorithm: str = 'sha256') -> Dict[str, Any]:
    """
    Validate an HMAC against a message and key.
    
    Args:
        message: The input message
        key: The secret key
        mac: The MAC to validate
        algorithm: The hash algorithm used (sha256, sha1, md5, etc.)
        
    Returns:
        Dictionary containing the validation result and explanation
    """
    # Compute the expected HMAC
    computed_result = compute_mac(message, key, algorithm)
    computed_hmac = computed_result["hmac"]
    
    # Compare with the provided MAC
    is_valid = hmac.compare_digest(computed_hmac, mac)
    
    # Prepare the response
    result = {
        "valid": is_valid,
        "computed_hmac": computed_hmac,
        "provided_hmac": mac,
        "algorithm": algorithm
    }
    
    # Add explanation if validation fails
    if not is_valid:
        result["explanation"] = "The provided MAC does not match the computed MAC for the given message and key."
    
    return result

def generate_hash_steps(message: str, algorithm: str) -> List[Dict[str, Any]]:
    """
    Generate step-by-step visualization of the hash computation process.
    
    Args:
        message: The input message
        algorithm: The hash algorithm
        
    Returns:
        List of steps for visualization
    """
    message_bytes = message.encode('utf-8')
    steps = []
    
    # Step 1: Input preparation
    steps.append({
        "step": "Input Preparation",
        "description": "Convert the input message to bytes",
        "message": message,
        "message_bytes": list(message_bytes),
        "message_binary": ' '.join(format(b, '08b') for b in message_bytes),
        "message_hex": message_bytes.hex()
    })
    
    # Step 2: Padding
    block_size = get_block_size(algorithm)
    padding_info = get_padding_info(message_bytes, algorithm)
    steps.append({
        "step": "Padding",
        "description": f"Pad the message to a multiple of {block_size} bytes",
        "original_length": len(message_bytes),
        "padded_length": padding_info["padded_length"],
        "padding_scheme": padding_info["scheme"],
        "block_size": block_size
    })
    
    # Step 3: Processing blocks
    steps.append({
        "step": "Block Processing",
        "description": f"Process the message in blocks of {block_size} bytes",
        "num_blocks": padding_info["padded_length"] // block_size,
        "block_size": block_size,
        "algorithm_details": get_algorithm_details(algorithm)
    })
    
    # Step 4: Final hash computation
    hash_obj = get_hash_object(algorithm)
    hash_obj.update(message_bytes)
    hash_result = hash_obj.hexdigest()
    hash_bytes = hash_obj.digest()
    
    steps.append({
        "step": "Final Hash",
        "description": "The final hash value",
        "hash_hex": hash_result,
        "hash_bytes": list(hash_bytes),
        "hash_binary": ' '.join(format(b, '08b') for b in hash_bytes),
        "hash_length_bits": len(hash_bytes) * 8,
        "hash_length_bytes": len(hash_bytes)
    })
    
    # Step 5: Avalanche effect demonstration
    if len(message) > 0:
        # Change one character in the message
        modified_message = list(message)
        change_index = min(len(message) - 1, 0)
        original_char = modified_message[change_index]
        
        # Change to the next character in ASCII
        modified_char = chr((ord(original_char) + 1) % 128)
        modified_message[change_index] = modified_char
        modified_message = ''.join(modified_message)
        
        # Compute hash of modified message
        modified_hash_obj = get_hash_object(algorithm)
        modified_hash_obj.update(modified_message.encode('utf-8'))
        modified_hash = modified_hash_obj.hexdigest()
        
        # Calculate bit difference
        original_bits = ''.join(format(b, '08b') for b in hash_bytes)
        modified_bits = ''.join(format(b, '08b') for b in modified_hash_obj.digest())
        bit_differences = sum(1 for a, b in zip(original_bits, modified_bits) if a != b)
        total_bits = len(original_bits)
        difference_percentage = (bit_differences / total_bits) * 100
        
        steps.append({
            "step": "Avalanche Effect",
            "description": "Demonstration of how a small change in input creates a large change in the hash",
            "original_message": message,
            "modified_message": modified_message,
            "change_description": f"Changed character at position {change_index} from '{original_char}' to '{modified_char}'",
            "original_hash": hash_result,
            "modified_hash": modified_hash,
            "bit_differences": bit_differences,
            "total_bits": total_bits,
            "difference_percentage": round(difference_percentage, 2)
        })
    
    return steps

def generate_hmac_steps(message: str, key: str, algorithm: str) -> List[Dict[str, Any]]:
    """
    Generate step-by-step visualization of the HMAC computation process.
    
    Args:
        message: The input message
        key: The secret key
        algorithm: The hash algorithm
        
    Returns:
        List of steps for visualization
    """
    message_bytes = message.encode('utf-8')
    key_bytes = key.encode('utf-8')
    steps = []
    
    # Get hash function and block size
    hash_func = get_hash_function(algorithm)
    block_size = get_block_size(algorithm)
    
    # Step 1: Key preparation
    if len(key_bytes) > block_size:
        # If key is longer than block size, hash it
        key_hash = hash_func(key_bytes).digest()
        processed_key = key_hash
        key_preparation = f"Key is longer than block size ({len(key_bytes)} > {block_size}), so it was hashed"
    else:
        # If key is shorter, pad it with zeros
        processed_key = key_bytes + b'\x00' * (block_size - len(key_bytes))
        key_preparation = f"Key is shorter than block size ({len(key_bytes)} < {block_size}), so it was padded with zeros"
    
    steps.append({
        "step": "Key Preparation",
        "description": "Prepare the key for HMAC computation",
        "original_key": key,
        "key_hex": key_bytes.hex(),
        "processed_key_hex": processed_key.hex(),
        "key_preparation": key_preparation,
        "block_size": block_size
    })
    
    # Step 2: Inner padding
    inner_pad = bytes(x ^ 0x36 for x in processed_key)
    steps.append({
        "step": "Inner Padding",
        "description": "XOR the processed key with the inner pad constant (0x36)",
        "inner_pad_hex": inner_pad.hex(),
        "operation": "processed_key XOR 0x36 (repeated)"
    })
    
    # Step 3: Outer padding
    outer_pad = bytes(x ^ 0x5C for x in processed_key)
    steps.append({
        "step": "Outer Padding",
        "description": "XOR the processed key with the outer pad constant (0x5C)",
        "outer_pad_hex": outer_pad.hex(),
        "operation": "processed_key XOR 0x5C (repeated)"
    })
    
    # Step 4: Inner hash
    inner_hash_input = inner_pad + message_bytes
    inner_hash = hash_func(inner_hash_input).digest()
    steps.append({
        "step": "Inner Hash",
        "description": "Hash the combination of inner pad and message",
        "inner_hash_input_hex": inner_hash_input.hex(),
        "inner_hash_hex": inner_hash.hex(),
        "operation": "hash(inner_pad + message)"
    })
    
    # Step 5: Outer hash (final HMAC)
    outer_hash_input = outer_pad + inner_hash
    hmac_result = hash_func(outer_hash_input).hexdigest()
    steps.append({
        "step": "Outer Hash (Final HMAC)",
        "description": "Hash the combination of outer pad and inner hash",
        "outer_hash_input_hex": outer_hash_input.hex(),
        "hmac_hex": hmac_result,
        "operation": "hash(outer_pad + inner_hash)"
    })
    
    # Step 6: Avalanche effect demonstration
    if len(message) > 0:
        # Change one character in the message
        modified_message = list(message)
        change_index = min(len(message) - 1, 0)
        original_char = modified_message[change_index]
        
        # Change to the next character in ASCII
        modified_char = chr((ord(original_char) + 1) % 128)
        modified_message[change_index] = modified_char
        modified_message = ''.join(modified_message)
        
        # Compute HMAC of modified message
        modified_hmac_obj = hmac.new(key_bytes, modified_message.encode('utf-8'), hash_func)
        modified_hmac = modified_hmac_obj.hexdigest()
        
        steps.append({
            "step": "Avalanche Effect",
            "description": "Demonstration of how a small change in the message creates a large change in the HMAC",
            "original_message": message,
            "modified_message": modified_message,
            "change_description": f"Changed character at position {change_index} from '{original_char}' to '{modified_char}'",
            "original_hmac": hmac_result,
            "modified_hmac": modified_hmac
        })
    
    return steps

def get_hash_object(algorithm: str):
    """Get a hash object for the specified algorithm."""
    if algorithm == 'md5':
        return hashlib.md5()
    elif algorithm == 'sha1':
        return hashlib.sha1()
    elif algorithm == 'sha256':
        return hashlib.sha256()
    elif algorithm == 'sha512':
        return hashlib.sha512()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")

def get_hash_function(algorithm: str):
    """Get a hash function for the specified algorithm."""
    if algorithm == 'md5':
        return hashlib.md5
    elif algorithm == 'sha1':
        return hashlib.sha1
    elif algorithm == 'sha256':
        return hashlib.sha256
    elif algorithm == 'sha512':
        return hashlib.sha512
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")

def get_block_size(algorithm: str) -> int:
    """Get the block size for the specified algorithm."""
    if algorithm == 'md5' or algorithm == 'sha1' or algorithm == 'sha256':
        return 64  # 512 bits = 64 bytes
    elif algorithm == 'sha512':
        return 128  # 1024 bits = 128 bytes
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")

def get_padding_info(message_bytes: bytes, algorithm: str) -> Dict[str, Any]:
    """Get information about the padding for the specified algorithm."""
    block_size = get_block_size(algorithm)
    
    # Calculate padded length (simplified)
    # In reality, hash functions add a 1 bit, then zeros, then the message length
    message_length = len(message_bytes)
    padded_length = ((message_length // block_size) + 1) * block_size
    
    return {
        "scheme": "Merkle–Damgård padding",
        "original_length": message_length,
        "padded_length": padded_length
    }

def get_algorithm_details(algorithm: str) -> Dict[str, Any]:
    """Get details about the specified hash algorithm."""
    if algorithm == 'md5':
        return {
            "name": "MD5",
            "output_size_bits": 128,
            "block_size_bits": 512,
            "rounds": 64,
            "operations": "Bitwise operations, modular addition, and bit rotation",
            "security_status": "Broken (vulnerable to collision attacks)"
        }
    elif algorithm == 'sha1':
        return {
            "name": "SHA-1",
            "output_size_bits": 160,
            "block_size_bits": 512,
            "rounds": 80,
            "operations": "Bitwise operations, modular addition, and bit rotation",
            "security_status": "Broken (vulnerable to collision attacks)"
        }
    elif algorithm == 'sha256':
        return {
            "name": "SHA-256",
            "output_size_bits": 256,
            "block_size_bits": 512,
            "rounds": 64,
            "operations": "Bitwise operations, modular addition, and bit rotation",
            "security_status": "Secure"
        }
    elif algorithm == 'sha512':
        return {
            "name": "SHA-512",
            "output_size_bits": 512,
            "block_size_bits": 1024,
            "rounds": 80,
            "operations": "Bitwise operations, modular addition, and bit rotation",
            "security_status": "Secure"
        }
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")