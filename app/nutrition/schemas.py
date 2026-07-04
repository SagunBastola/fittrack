from pydantic import BaseModel, Field
from datetime import datetime

class NutritionCreate(BaseModel):
    food_name: str = Field(..., min_length=2, max_length=100, example="salad")
    calories: int = Field(..., gt=0, example=450)
    protein_g: float = Field(0.0, ge=0.0, description="Protein in grams", example=35.5)
    carbs_g: float = Field(0.0, ge=0.0, description="Carbohydrates in grams", example=12.0)
    fats_g: float = Field(0.0, ge=0.0, description="Fats in grams", example=15.0)

class NutritionOut(NutritionCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class DailySummaryOut(BaseModel):
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fats: float