from fastapi import APIRouter,Depends,status,HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.nutrition import crud, schemas

router=APIRouter()

@router.post("/log",response_model=schemas.NutritionOut,status_code=status.HTTP_201_CREATED,summary="Log a meal or food item")
async def log_food(food_in : schemas.NutritionCreate,db : Session = Depends(get_db),current_user : User = Depends(get_current_user)):
    return crud.create_food_log(db=db,food_in=food_in,user_id = current_user.id)

@router.get("/daily-summary",response_model=schemas.DailySummaryOut,summary="Get calorie and macro summaries for today")
async def get_daily_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = crud.get_today_nutrition_summary(db=db, user_id=current_user.id)
    return summary 