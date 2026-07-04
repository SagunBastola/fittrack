from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
import traceback
from app.auth.router import router as auth_router
from app.analytics.router import router as analytics_router
from app.nutrition.router import router as nutrition_router
from app.workouts.router import router as workout_router
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
import app.auth.models 
import app.workouts.models
import app.nutrition.models

Base.metadata.create_all(bind=engine)

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "traceback": traceback.format_exc().split("\n")
        }
    )
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(nutrition_router, prefix="/nutrition", tags=["nutrition"])
app.include_router(workout_router, prefix="/workouts", tags=["workouts"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"]) 
