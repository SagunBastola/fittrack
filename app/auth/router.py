from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.auth import schemas, models, utils

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post(
    "/register", 
    response_model=schemas.UserOut, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new fitness user"
)
async def register_user(
    user_in: schemas.UserRegister, 
    db: Session = Depends(get_db)
):
    db_user_username = db.query(models.User).filter(models.User.username == user_in.username).first()
    if db_user_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    db_user_email = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    hashed_password = utils.get_password_hash(user_in.password)

    user_data = user_in.model_dump(exclude={"password"})
    new_user = models.User(**user_data, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post(
    "/token", 
    response_model=schemas.Token,
    summary="Login to get access token"
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}