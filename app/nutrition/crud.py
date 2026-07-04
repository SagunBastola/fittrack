from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, time
from app.nutrition import models, schemas

def create_food_log(db: Session, food_in: schemas.NutritionCreate, user_id: int):
    db_food = models.NutritionLog(**food_in.model_dump(), user_id=user_id)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

def get_today_nutrition_summary(db: Session, user_id: int):
    # Determine the boundaries of "today" relative to midnight UTC
    today_start = datetime.utcnow().combine(datetime.utcnow().date(), time.min)
    today_end = datetime.utcnow().combine(datetime.utcnow().date(), time.max)

    # Perform an aggregate query filtering items logged today by this user
    result = db.query(
        func.sum(models.NutritionLog.calories).label("calories"),
        func.sum(models.NutritionLog.protein_g).label("protein"),
        func.sum(models.NutritionLog.carbs_g).label("carbs"),
        func.sum(models.NutritionLog.fats_g).label("fats")
    ).filter(
        models.NutritionLog.user_id == user_id,
        models.NutritionLog.timestamp >= today_start,
        models.NutritionLog.timestamp <= today_end
    ).first()

    return {
        "total_calories": result.calories or 0,
        "total_protein": round(result.protein or 0.0, 1),
        "total_carbs": round(result.carbs or 0.0, 1),
        "total_fats": round(result.fats or 0.0, 1)
    }