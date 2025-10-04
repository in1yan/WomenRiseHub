import bcrypt
import hashlib

def hash_pwd(password: str) -> str:
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    
    # If password is longer than 72 bytes, pre-hash it with SHA256
    if len(password_bytes) > 72:
        password_bytes = hashlib.sha256(password_bytes).digest()[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_pwd(plain_password: str, hashed_password: str) -> bool:
    # Convert inputs to bytes
    password_bytes = plain_password.encode('utf-8')
    
    # Apply same pre-hashing logic for verification
    if len(password_bytes) > 72:
        password_bytes = hashlib.sha256(password_bytes).digest()[:72]
    
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)