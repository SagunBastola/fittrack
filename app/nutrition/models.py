from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String(100), nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fats_g = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User")