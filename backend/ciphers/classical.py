"""
Implementation of classical ciphers:
- Caesar Cipher
- Substitution Cipher
- Vigenère Cipher
"""

def caesar_cipher(text, shift, encrypt=True):
    """
    Implements the Caesar cipher.
    
    Args:
        text (str): The text to encrypt or decrypt
        shift (int): The shift value (key)
        encrypt (bool): True for encryption, False for decryption
    
    Returns:
        tuple: (result_text, steps)
            - result_text (str): The encrypted or decrypted text
            - steps (list): List of dictionaries containing step-by-step information
    """
    if not encrypt:
        shift = -shift  # For decryption, shift in the opposite direction
    
    result = ""
    steps = []
    
    for i, char in enumerate(text):
        step_info = {
            "position": i,
            "original_char": char,
            "shift_value": shift
        }
        
        # Only encrypt/decrypt letters
        if char.isalpha():
            # Determine the ASCII offset based on case
            ascii_offset = ord('A') if char.isupper() else ord('a')
            
            # Convert to 0-25 range, apply shift, and convert back to ASCII
            shifted_value = (ord(char) - ascii_offset + shift) % 26 + ascii_offset
            shifted_char = chr(shifted_value)
            
            step_info["is_letter"] = True
            step_info["ascii_value"] = ord(char)
            step_info["offset"] = ascii_offset
            step_info["position_in_alphabet"] = ord(char) - ascii_offset
            step_info["shifted_position"] = (ord(char) - ascii_offset + shift) % 26
            step_info["new_ascii_value"] = shifted_value
            step_info["result_char"] = shifted_char
            
            result += shifted_char
        else:
            step_info["is_letter"] = False
            step_info["result_char"] = char
            result += char
        
        steps.append(step_info)
    
    return result, steps

def substitution_cipher(text, key, encrypt=True):
    """
    Implements the Substitution cipher.
    
    Args:
        text (str): The text to encrypt or decrypt
        key (str): The substitution key (26 unique letters)
        encrypt (bool): True for encryption, False for decryption
    
    Returns:
        tuple: (result_text, steps)
            - result_text (str): The encrypted or decrypted text
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Validate the key
    if len(set(key.lower())) != 26 or len(key) != 26:
        raise ValueError("Key must contain all 26 letters exactly once")
    
    result = ""
    steps = []
    
    # Create mapping dictionaries
    if encrypt:
        # For encryption: map from alphabet to key
        upper_map = {chr(i + ord('A')): key[i].upper() for i in range(26)}
        lower_map = {chr(i + ord('a')): key[i].lower() for i in range(26)}
    else:
        # For decryption: map from key to alphabet
        upper_map = {key[i].upper(): chr(i + ord('A')) for i in range(26)}
        lower_map = {key[i].lower(): chr(i + ord('a')) for i in range(26)}
    
    for i, char in enumerate(text):
        step_info = {
            "position": i,
            "original_char": char
        }
        
        if char.isupper() and char in upper_map:
            result_char = upper_map[char]
            step_info["is_letter"] = True
            step_info["case"] = "upper"
            step_info["mapping"] = f"{char} → {result_char}"
            step_info["result_char"] = result_char
            result += result_char
        elif char.islower() and char in lower_map:
            result_char = lower_map[char]
            step_info["is_letter"] = True
            step_info["case"] = "lower"
            step_info["mapping"] = f"{char} → {result_char}"
            step_info["result_char"] = result_char
            result += result_char
        else:
            step_info["is_letter"] = False
            step_info["result_char"] = char
            result += char
        
        steps.append(step_info)
    
    return result, steps

def vigenere_cipher(text, key, encrypt=True):
    """
    Implements the Vigenère cipher.
    
    Args:
        text (str): The text to encrypt or decrypt
        key (str): The keyword
        encrypt (bool): True for encryption, False for decryption
    
    Returns:
        tuple: (result_text, steps)
            - result_text (str): The encrypted or decrypted text
            - steps (list): List of dictionaries containing step-by-step information
    """
    # Validate the key
    if not key.isalpha():
        raise ValueError("Key must contain only letters")
    
    key = key.upper()
    result = ""
    steps = []
    
    # Keep track of the key index (only increment for letters in the text)
    key_idx = 0
    
    for i, char in enumerate(text):
        step_info = {
            "position": i,
            "original_char": char
        }
        
        if char.isalpha():
            # Get the corresponding key character
            key_char = key[key_idx % len(key)]
            key_shift = ord(key_char) - ord('A')
            
            # Apply the shift (positive for encryption, negative for decryption)
            if not encrypt:
                key_shift = -key_shift
            
            # Determine the ASCII offset based on case
            ascii_offset = ord('A') if char.isupper() else ord('a')
            
            # Convert to 0-25 range, apply shift, and convert back to ASCII
            shifted_value = (ord(char) - ascii_offset + key_shift) % 26 + ascii_offset
            shifted_char = chr(shifted_value)
            
            step_info["is_letter"] = True
            step_info["key_char"] = key_char
            step_info["key_position"] = key_idx % len(key)
            step_info["key_shift"] = key_shift
            step_info["ascii_value"] = ord(char)
            step_info["offset"] = ascii_offset
            step_info["position_in_alphabet"] = ord(char) - ascii_offset
            step_info["shifted_position"] = (ord(char) - ascii_offset + key_shift) % 26
            step_info["new_ascii_value"] = shifted_value
            step_info["result_char"] = shifted_char
            
            result += shifted_char
            key_idx += 1
        else:
            step_info["is_letter"] = False
            step_info["result_char"] = char
            result += char
        
        steps.append(step_info)
    
    return result, steps