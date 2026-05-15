from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime, timedelta
import os, shutil, uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

SLA_HOURS = {"Low": 72, "Medium": 48, "High": 24, "Critical": 4}

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "database", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def generate_complaint_number(db: Session) -> str:
    count = db.query(models.Complaint).count()
    return f"CMP-{datetime.now().strftime('%Y%m')}-{str(count + 1).zfill(4)}"


@router.post("/", response_model=schemas.ComplaintOut)
def create_complaint(
    data: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    sla_hours = SLA_HOURS.get(data.priority, 48)
    complaint = models.Complaint(
        complaint_number=generate_complaint_number(db),
        customer_id=current_user.id,
        category_id=data.category_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        status="Open",
        sla_deadline=datetime.utcnow() + timedelta(hours=sla_hours)
    )
    db.add(complaint)
    db.flush()
    history = models.ComplaintHistory(
        complaint_id=complaint.id,
        updated_by=current_user.id,
        old_status=None,
        new_status="Open",
        notes="Complaint registered"
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/", response_model=List[schemas.ComplaintListOut])
def list_complaints(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    is_escalated: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Complaint).options(
        joinedload(models.Complaint.customer).joinedload(models.User.role),
        joinedload(models.Complaint.agent).joinedload(models.User.role),
        joinedload(models.Complaint.category)
    )

    role = current_user.role.name
    if role == "Customer":
        query = query.filter(models.Complaint.customer_id == current_user.id)
    elif role == "Support Agent":
        query = query.filter(models.Complaint.agent_id == current_user.id)

    if status:
        query = query.filter(models.Complaint.status == status)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
    if category_id:
        query = query.filter(models.Complaint.category_id == category_id)
    if is_escalated is not None:
        query = query.filter(models.Complaint.is_escalated == is_escalated)
    if search:
        query = query.filter(or_(
            models.Complaint.title.ilike(f"%{search}%"),
            models.Complaint.complaint_number.ilike(f"%{search}%"),
            models.Complaint.description.ilike(f"%{search}%")
        ))

    return query.order_by(models.Complaint.created_at.desc()).all()


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).options(
        joinedload(models.Complaint.customer).joinedload(models.User.role),
        joinedload(models.Complaint.agent).joinedload(models.User.role),
        joinedload(models.Complaint.category),
        joinedload(models.Complaint.history).joinedload(models.ComplaintHistory.updated_by_user).joinedload(models.User.role),
        joinedload(models.Complaint.attachments),
        joinedload(models.Complaint.feedback)
    ).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    role = current_user.role.name
    if role == "Customer" and complaint.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "Support Agent" and complaint.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return complaint


@router.patch("/{complaint_id}", response_model=schemas.ComplaintOut)
def update_complaint(
    complaint_id: int,
    data: schemas.ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = complaint.status

    if data.agent_id is not None:
        complaint.agent_id = data.agent_id
        if complaint.status == "Open":
            complaint.status = "Assigned"
    if data.status is not None:
        complaint.status = data.status
        if data.status == "Resolved":
            complaint.resolved_at = datetime.utcnow()
        if data.status == "Escalated":
            complaint.is_escalated = True
    if data.priority is not None:
        complaint.priority = data.priority
        sla_hours = SLA_HOURS.get(data.priority, 48)
        complaint.sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)
    if data.resolution_notes is not None:
        complaint.resolution_notes = data.resolution_notes

    new_status = complaint.status
    if old_status != new_status or data.notes:
        history = models.ComplaintHistory(
            complaint_id=complaint.id,
            updated_by=current_user.id,
            old_status=old_status,
            new_status=new_status,
            notes=data.notes
        )
        db.add(history)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("Admin"))
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint deleted"}


@router.post("/{complaint_id}/upload")
async def upload_attachment(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOADS_DIR, unique_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    attachment = models.Attachment(
        complaint_id=complaint_id,
        filename=file.filename,
        file_path=file_path
    )
    db.add(attachment)
    db.commit()
    return {"message": "File uploaded", "filename": file.filename}
