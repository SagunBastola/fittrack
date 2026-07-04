from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # 🛠️ ADD THESE THREE COLUMNS SO SQLALCHEMY RECOGNIZES THEM:
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    fitness_goal = Column(String, nullable=False)
    
    # Links back to the Workout model
    workouts = relationship("Workout", back_populates="owner", cascade="all, delete-orphan")