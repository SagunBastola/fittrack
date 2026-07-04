from sqlalchemy.orm import Session
from app.workouts import models, schemas

def create_user_workout(db: Session, workout: schemas.WorkoutCreate, user_id: int):
    db_workout = models.Workout(**workout.model_dump(), user_id=user_id)
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

def get_user_workouts(db: Session, user_id: int, skip: int = 0, limit: int = 10, exercise_name: str = None):
    query = db.query(models.Workout).filter(models.Workout.user_id == user_id)
    if exercise_name:
        query = query.filter(models.Workout.exercise_name.ilike(f"%{exercise_name}%"))
    return query.offset(skip).limit(limit).all()

def delete_user_workout(db: Session, workout_id: int, user_id: int):
    db_workout = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user_id).first()
    if not db_workout:
        return False
    db.delete(db_workout)
    db.commit()
    return True