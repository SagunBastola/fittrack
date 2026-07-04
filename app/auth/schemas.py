from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    weight_kg: float = Field(..., gt=0)
    height_cm: float = Field(..., gt=0)
    fitness_goal: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    weight_kg: float
    height_cm: float
    fitness_goal: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None