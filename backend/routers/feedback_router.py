from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("/", response_model=schemas.FeedbackOut)
def submit_feedback(
    data: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == data.complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only rate your own complaints")
    if complaint.status not in ["Resolved", "Closed"]:
        raise HTTPException(status_code=400, detail="Can only rate resolved or closed complaints")
    existing = db.query(models.Feedback).filter(models.Feedback.complaint_id == data.complaint_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this complaint")
    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    feedback = models.Feedback(
        complaint_id=data.complaint_id,
        customer_id=current_user.id,
        rating=data.rating,
        comments=data.comments
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/", response_model=List[schemas.FeedbackOut])
def list_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("Admin", "Supervisor"))
):
    return db.query(models.Feedback).all()
