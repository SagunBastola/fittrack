import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt 

from app.database import get_db
from app.auth import models, schemas, utils

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
ALGORITHM = "HS256"

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
        token_data = schemas.TokenData(username=username)
        
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    
    if user is None:
        raise credentials_exception
        
    return user