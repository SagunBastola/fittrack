from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class WorkoutCreate(BaseModel):
    exercise_name: str = Field(..., example="Bench Press", description="Name of the exercise")
    sets: int = Field(..., gt=0, example=3, description="Number of sets performed")
    reps: int = Field(..., gt=0, example=10, description="Number of repetitions per set")
    weight_used: float = Field(..., gt=0, example=100.0, description="Weight used for the exercise in kilograms")
    
class WorkoutOut(WorkoutCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True