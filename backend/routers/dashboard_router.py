from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    base = db.query(models.Complaint)
    role = current_user.role.name

    if role == "Customer":
        base = base.filter(models.Complaint.customer_id == current_user.id)
    elif role == "Support Agent":
        base = base.filter(models.Complaint.agent_id == current_user.id)

    total = base.count()
    open_count = base.filter(models.Complaint.status == "Open").count()
    in_progress = base.filter(models.Complaint.status.in_(["Assigned", "In Progress", "Pending Customer Response"])).count()
    resolved = base.filter(models.Complaint.status == "Resolved").count()
    escalated = base.filter(models.Complaint.is_escalated == True).count()
    closed = base.filter(models.Complaint.status == "Closed").count()
    sla_breached = base.filter(
        models.Complaint.sla_deadline < datetime.utcnow(),
        models.Complaint.status.notin_(["Resolved", "Closed"])
    ).count()

    resolved_complaints = base.filter(
        models.Complaint.resolved_at != None,
        models.Complaint.status.in_(["Resolved", "Closed"])
    ).all()

    avg_hours = None
    if resolved_complaints:
        total_hours = sum(
            (c.resolved_at - c.created_at).total_seconds() / 3600
            for c in resolved_complaints
            if c.resolved_at
        )
        avg_hours = round(total_hours / len(resolved_complaints), 1)

    return schemas.DashboardStats(
        total=total,
        open=open_count,
        in_progress=in_progress,
        resolved=resolved,
        escalated=escalated,
        closed=closed,
        sla_breached=sla_breached,
        avg_resolution_hours=avg_hours
    )


@router.get("/category-breakdown")
def category_breakdown(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    results = (
        db.query(models.Category.name, func.count(models.Complaint.id).label("count"))
        .join(models.Complaint, models.Complaint.category_id == models.Category.id, isouter=True)
        .group_by(models.Category.id)
        .all()
    )
    return [{"category": r.name, "count": r.count} for r in results]


@router.get("/priority-breakdown")
def priority_breakdown(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    results = (
        db.query(models.Complaint.priority, func.count(models.Complaint.id).label("count"))
        .group_by(models.Complaint.priority)
        .all()
    )
    return [{"priority": r.priority, "count": r.count} for r in results]


@router.get("/agent-performance")
def agent_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles("Admin", "Supervisor"))
):
    agents = db.query(models.User).join(models.Role).filter(models.Role.name == "Support Agent").all()
    result = []
    for agent in agents:
        assigned = db.query(models.Complaint).filter(models.Complaint.agent_id == agent.id).count()
        resolved = db.query(models.Complaint).filter(
            models.Complaint.agent_id == agent.id,
            models.Complaint.status.in_(["Resolved", "Closed"])
        ).count()
        result.append({
            "agent": agent.name,
            "assigned": assigned,
            "resolved": resolved
        })
    return result
