"""
Implementation of modern ciphers:
- AES (ECB, CBC, CTR modes)
- 3DES
"""

import os
import base64
import json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

def aes_encryption(plaintext, key, mode_name):
    """
    Implements AES encryption with different modes.
    
    Args:
        plaintext (str): The text to encrypt
        key (str): The encryption key
        mode_name (str): The mode of operation (ecb, cbc, ctr)
    
    Returns:
        tuple: (ciphertext, iv, steps)
            - ciphertext (str): Base64-encoded encrypted text
            - iv (str): Base64-encoded initialization vector (if applicable)
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Normalize inputs
    mode_name = mode_name.lower()
    
    # Validate mode
    if mode_name not in ['ecb', 'cbc', 'ctr']:
        raise ValueError(f"Unsupported AES mode: {mode_name}")
    
    # Prepare the key (AES requires 16, 24, or 32 bytes)
    key_bytes = derive_key(key, 32)  # Use AES-256
    
    # Convert plaintext to bytes
    plaintext_bytes = plaintext.encode('utf-8')
    
    # Initialize steps
    steps = []
    steps.append({
        "step": "Input Preparation",
        "plaintext": plaintext,
        "plaintext_hex": plaintext_bytes.hex(),
        "key": key,
        "key_hex": key_bytes.hex(),
        "key_length_bits": len(key_bytes) * 8
    })
    
    # Apply padding (except for CTR mode which doesn't require it)
    if mode_name != 'ctr':
        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded_data = padder.update(plaintext_bytes) + padder.finalize()
        
        steps.append({
            "step": "Padding",
            "algorithm": "PKCS7",
            "block_size_bytes": algorithms.AES.block_size // 8,
            "original_length": len(plaintext_bytes),
            "padded_length": len(padded_data),
            "padded_data_hex": padded_data.hex()
        })
    else:
        padded_data = plaintext_bytes
    
    # Generate IV for CBC and CTR modes
    iv = None
    if mode_name in ['cbc', 'ctr']:
        iv = os.urandom(16)  # AES block size is 128 bits (16 bytes)
        
        steps.append({
            "step": "IV Generation",
            "iv_hex": iv.hex(),
            "iv_length_bytes": len(iv)
        })
    
    # Create the appropriate mode object
    if mode_name == 'ecb':
        mode_obj = modes.ECB()
        steps.append({
            "step": "Mode Selection",
            "mode": "ECB (Electronic Codebook)",
            "description": "Each block is encrypted independently"
        })
    elif mode_name == 'cbc':
        mode_obj = modes.CBC(iv)
        steps.append({
            "step": "Mode Selection",
            "mode": "CBC (Cipher Block Chaining)",
            "description": "Each block is XORed with the previous ciphertext block before encryption"
        })
    elif mode_name == 'ctr':
        mode_obj = modes.CTR(iv)
        steps.append({
            "step": "Mode Selection",
            "mode": "CTR (Counter)",
            "description": "Encrypts a counter value and XORs the result with the plaintext"
        })
    
    # Create the cipher object
    cipher = Cipher(algorithms.AES(key_bytes), mode_obj)
    encryptor = cipher.encryptor()
    
    # Encrypt the data
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    # Record the encryption step
    steps.append({
        "step": "Encryption",
        "input_hex": padded_data.hex(),
        "output_hex": ciphertext.hex(),
        "output_length_bytes": len(ciphertext)
    })
    
    # Encode the results as base64 for easier transmission
    ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
    iv_b64 = base64.b64encode(iv).decode('utf-8') if iv else None
    
    steps.append({
        "step": "Output Encoding",
        "encoding": "Base64",
        "ciphertext_base64": ciphertext_b64,
        "iv_base64": iv_b64
    })
    
    return ciphertext_b64, iv_b64, steps

def aes_decryption(ciphertext_b64, key, mode_name, iv_b64=None):
    """
    Implements AES decryption with different modes.
    
    Args:
        ciphertext_b64 (str): Base64-encoded encrypted text
        key (str): The decryption key
        mode_name (str): The mode of operation (ecb, cbc, ctr)
        iv_b64 (str, optional): Base64-encoded initialization vector
    
    Returns:
        tuple: (plaintext, steps)
            - plaintext (str): The decrypted text
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Normalize inputs
    mode_name = mode_name.lower()
    
    # Validate mode
    if mode_name not in ['ecb', 'cbc', 'ctr']:
        raise ValueError(f"Unsupported AES mode: {mode_name}")
    
    # Check if IV is required
    if mode_name in ['cbc', 'ctr'] and not iv_b64:
        raise ValueError(f"IV is required for {mode_name.upper()} mode")
    
    # Prepare the key
    key_bytes = derive_key(key, 32)  # Use AES-256
    
    # Decode the ciphertext and IV from base64
    ciphertext = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64) if iv_b64 else None
    
    # Initialize steps
    steps = []
    steps.append({
        "step": "Input Preparation",
        "ciphertext_base64": ciphertext_b64,
        "ciphertext_hex": ciphertext.hex(),
        "iv_base64": iv_b64,
        "iv_hex": iv.hex() if iv else None,
        "key": key,
        "key_hex": key_bytes.hex(),
        "key_length_bits": len(key_bytes) * 8
    })
    
    # Create the appropriate mode object
    if mode_name == 'ecb':
        mode_obj = modes.ECB()
    elif mode_name == 'cbc':
        mode_obj = modes.CBC(iv)
    elif mode_name == 'ctr':
        mode_obj = modes.CTR(iv)
    
    steps.append({
        "step": "Mode Selection",
        "mode": mode_name.upper()
    })
    
    # Create the cipher object
    cipher = Cipher(algorithms.AES(key_bytes), mode_obj)
    decryptor = cipher.decryptor()
    
    # Decrypt the data
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
    
    steps.append({
        "step": "Decryption",
        "input_hex": ciphertext.hex(),
        "output_hex": decrypted_data.hex(),
        "output_length_bytes": len(decrypted_data)
    })
    
    # Remove padding (except for CTR mode)
    if mode_name != 'ctr':
        unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
        unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()
        
        steps.append({
            "step": "Unpadding",
            "algorithm": "PKCS7",
            "padded_length": len(decrypted_data),
            "unpadded_length": len(unpadded_data),
            "unpadded_data_hex": unpadded_data.hex()
        })
    else:
        unpadded_data = decrypted_data
    
    # Convert bytes back to string
    plaintext = unpadded_data.decode('utf-8')
    
    steps.append({
        "step": "Output Decoding",
        "plaintext": plaintext
    })
    
    return plaintext, steps

def des3_encryption(plaintext, key):
    """
    Implements 3DES encryption.
    
    Args:
        plaintext (str): The text to encrypt
        key (str): The encryption key
    
    Returns:
        tuple: (ciphertext, iv, steps)
            - ciphertext (str): Base64-encoded encrypted text
            - iv (str): Base64-encoded initialization vector
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Prepare the key (3DES requires 24 bytes)
    key_bytes = derive_key(key, 24)
    
    # Convert plaintext to bytes
    plaintext_bytes = plaintext.encode('utf-8')
    
    # Initialize steps
    steps = []
    steps.append({
        "step": "Input Preparation",
        "plaintext": plaintext,
        "plaintext_hex": plaintext_bytes.hex(),
        "key": key,
        "key_hex": key_bytes.hex(),
        "key_length_bits": len(key_bytes) * 8
    })
    
    # Apply padding
    padder = padding.PKCS7(algorithms.TripleDES.block_size).padder()
    padded_data = padder.update(plaintext_bytes) + padder.finalize()
    
    steps.append({
        "step": "Padding",
        "algorithm": "PKCS7",
        "block_size_bytes": algorithms.TripleDES.block_size // 8,
        "original_length": len(plaintext_bytes),
        "padded_length": len(padded_data),
        "padded_data_hex": padded_data.hex()
    })
    
    # Generate IV
    iv = os.urandom(8)  # 3DES block size is 64 bits (8 bytes)
    
    steps.append({
        "step": "IV Generation",
        "iv_hex": iv.hex(),
        "iv_length_bytes": len(iv)
    })
    
    # Create the cipher object (using CBC mode)
    cipher = Cipher(algorithms.TripleDES(key_bytes), modes.CBC(iv))
    encryptor = cipher.encryptor()
    
    # Encrypt the data
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    steps.append({
        "step": "Encryption",
        "mode": "CBC (Cipher Block Chaining)",
        "input_hex": padded_data.hex(),
        "output_hex": ciphertext.hex(),
        "output_length_bytes": len(ciphertext)
    })
    
    # Encode the results as base64 for easier transmission
    ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
    iv_b64 = base64.b64encode(iv).decode('utf-8')
    
    steps.append({
        "step": "Output Encoding",
        "encoding": "Base64",
        "ciphertext_base64": ciphertext_b64,
        "iv_base64": iv_b64
    })
    
    return ciphertext_b64, iv_b64, steps

def des3_decryption(ciphertext_b64, key, iv_b64):
    """
    Implements 3DES decryption.
    
    Args:
        ciphertext_b64 (str): Base64-encoded encrypted text
        key (str): The decryption key
        iv_b64 (str): Base64-encoded initialization vector
    
    Returns:
        tuple: (plaintext, steps)
            - plaintext (str): The decrypted text
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Prepare the key
    key_bytes = derive_key(key, 24)
    
    # Decode the ciphertext and IV from base64
    ciphertext = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64)
    
    # Initialize steps
    steps = []
    steps.append({
        "step": "Input Preparation",
        "ciphertext_base64": ciphertext_b64,
        "ciphertext_hex": ciphertext.hex(),
        "iv_base64": iv_b64,
        "iv_hex": iv.hex(),
        "key": key,
        "key_hex": key_bytes.hex(),
        "key_length_bits": len(key_bytes) * 8
    })
    
    # Create the cipher object
    cipher = Cipher(algorithms.TripleDES(key_bytes), modes.CBC(iv))
    decryptor = cipher.decryptor()
    
    # Decrypt the data
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
    
    steps.append({
        "step": "Decryption",
        "mode": "CBC (Cipher Block Chaining)",
        "input_hex": ciphertext.hex(),
        "output_hex": decrypted_data.hex(),
        "output_length_bytes": len(decrypted_data)
    })
    
    # Remove padding
    unpadder = padding.PKCS7(algorithms.TripleDES.block_size).unpadder()
    unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()
    
    steps.append({
        "step": "Unpadding",
        "algorithm": "PKCS7",
        "padded_length": len(decrypted_data),
        "unpadded_length": len(unpadded_data),
        "unpadded_data_hex": unpadded_data.hex()
    })
    
    # Convert bytes back to string
    plaintext = unpadded_data.decode('utf-8')
    
    steps.append({
        "step": "Output Decoding",
        "plaintext": plaintext
    })
    
    return plaintext, steps

def derive_key(key_str, length):
    """
    Derives a key of the specified length from the input string.
    
    Args:
        key_str (str): The input key string
        length (int): The desired key length in bytes
    
    Returns:
        bytes: The derived key
    """
    # Simple key derivation: repeat or truncate the key to the desired length
    key_bytes = key_str.encode('utf-8')
    
    if len(key_bytes) < length:
        # If the key is too short, repeat it
        key_bytes = (key_bytes * (length // len(key_bytes) + 1))[:length]
    elif len(key_bytes) > length:
        # If the key is too long, truncate it
        key_bytes = key_bytes[:length]
    
    return key_bytes