from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Dict, Any

# Relative imports from our structured app modules
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.workouts import models as workout_models
from app.nutrition import models as nutrition_models

router = APIRouter()
@router.get(
    "/macro-calculator",
    summary="Calculate target daily macros based on user profile"
)
async def calculate_macros(
    activity_level: str = Query(
        "moderate", 
        description="Options: sedentary, light, moderate, active, extreme"
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Dynamically calculates target daily calories and macronutrient breakdowns
    (Protein, Carbs, Fats) using the user's stored height, weight, and fitness goal.
    """
    # 1. Simple Basal Metabolic Rate (BMR) estimation using user's physical details
    # Approximation: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (assumed 25)
    base_bmr = (10 * current_user.weight_kg) + (6.25 * current_user.height_cm) - 125
    
    # 2. Adjust for physical activity multiplier
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "extreme": 1.9
    }
    multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
    tdee = base_bmr * multiplier  # Total Daily Energy Expenditure

    # 3. Adjust calories depending on fitness goals
    goal = current_user.fitness_goal.lower()
    if "lose" in goal or "cut" in goal:
        target_calories = tdee - 500
        protein_pct, carbs_pct, fats_pct = 0.40, 0.30, 0.30  # High protein split
    elif "gain" in goal or "bulk" in goal:
        target_calories = tdee + 500
        protein_pct, carbs_pct, fats_pct = 0.30, 0.50, 0.20  # High carb split
    else:
        target_calories = tdee
        protein_pct, carbs_pct, fats_pct = 0.30, 0.40, 0.30  # Balanced split

    # 4. Convert split percentages to actual target grams
    # 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    return {
        "username": current_user.username,
        "fitness_goal": current_user.fitness_goal,
        "calculated_target_calories": round(target_calories),
        "target_macronutrients": {
            "protein_g": round((target_calories * protein_pct) / 4),
            "carbs_g": round((target_calories * carbs_pct) / 4),
            "fats_g": round((target_calories * fats_pct) / 9)
        }
    }


# -------------------------------------------------------------
# 2. GET /analytics/report/export - Aggregate fitness profile data
# -------------------------------------------------------------
@router.get(
    "/report/export",
    summary="Gather overall fitness progress data metrics"
)
async def export_fitness_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compiles lifetime workout sessions logs and cumulative nutritional inputs
    registered by the user, providing clean aggregates for metric processing.
    """
    # Query historic totals
    total_workouts = db.query(workout_models.Workout).filter(
        workout_models.Workout.user_id == current_user.id
    ).count()

    total_food_logs = db.query(nutrition_models.NutritionLog).filter(
        nutrition_models.NutritionLog.user_id == current_user.id
    ).count()

    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "metrics_summary": {
            "lifetime_logged_workouts": total_workouts,
            "lifetime_logged_meals": total_food_logs,
            "current_weight_kg": current_user.weight_kg
        },
        "status": "Ready for export processing"
    }