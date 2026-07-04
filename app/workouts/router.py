from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.workouts import crud, schemas
from app.auth.dependencies import get_current_user
from app.auth.models import User

router = APIRouter()

@router.post("/", response_model=schemas.WorkoutOut, status_code=status.HTTP_201_CREATED,summary="Create a new workout")
async def create_workout(
    workout: schemas.WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_user_workout(db=db, workout=workout, user_id=current_user.id)

@router.get("/",response_model=List[schemas.WorkoutOut], summary="Get all workouts for the current user")
async def get_workouts(
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
        exercise_name: Optional[str] = Query(None, description="Filter workouts by exercise name"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    workouts = crud.get_user_workouts(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit, 
        exercise_name=exercise_name
    )
    return workouts

@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a workout by ID")
async def delete_workout(
    workout_id: int = Path(..., description="The ID of the workout to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sucess=crud.delete_user_workout(db=db, workout_id=workout_id, user_id=current_user.id)  
    if not sucess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found or not authorized to delete")
    return {"detail": "Workout deleted successfully"}
    
    