import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jwt import PyJWTError, encode, decode 
import jwt
from pwdlib import PasswordHash

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against the stored database hash"""
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Securely hashes a user's plain text password"""
    return password_hash.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt