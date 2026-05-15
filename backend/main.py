from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, complaints_router, users_router, categories_router, feedback_router, dashboard_router, roles_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Complaint & Resolution Tracking System",
    description="CCRTS API - Manage and track customer complaints end-to-end",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(complaints_router.router)
app.include_router(users_router.router)
app.include_router(categories_router.router)
app.include_router(feedback_router.router)
app.include_router(dashboard_router.router)
app.include_router(roles_router.router)


@app.get("/")
def root():
    return {"message": "CCRTS API is running", "docs": "/docs"}
