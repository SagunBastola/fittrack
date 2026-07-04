from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    exercise_name = Column(String(100), nullable=False, index=True)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight_used = Column(Float, nullable=False) 
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="workouts")