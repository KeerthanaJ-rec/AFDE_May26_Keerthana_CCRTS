from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class RoleOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role_id: int = 4  # default: Customer


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleOut
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LoginRequest(BaseModel):
    email: str
    password: str


class CategoryOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class AttachmentOut(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    class Config:
        from_attributes = True


class ComplaintHistoryOut(BaseModel):
    id: int
    old_status: Optional[str]
    new_status: str
    notes: Optional[str]
    updated_at: datetime
    updated_by_user: UserOut
    class Config:
        from_attributes = True


class FeedbackOut(BaseModel):
    id: int
    rating: int
    comments: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    title: str
    description: str
    category_id: int
    priority: str = "Medium"


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    agent_id: Optional[int] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    notes: Optional[str] = None


class ComplaintOut(BaseModel):
    id: int
    complaint_number: str
    title: str
    description: str
    priority: str
    status: str
    is_escalated: bool
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    sla_deadline: Optional[datetime]
    customer: UserOut
    agent: Optional[UserOut]
    category: CategoryOut
    attachments: List[AttachmentOut] = []
    history: List[ComplaintHistoryOut] = []
    feedback: Optional[FeedbackOut] = None
    class Config:
        from_attributes = True


class ComplaintListOut(BaseModel):
    id: int
    complaint_number: str
    title: str
    priority: str
    status: str
    is_escalated: bool
    created_at: datetime
    sla_deadline: Optional[datetime]
    customer: UserOut
    agent: Optional[UserOut]
    category: CategoryOut
    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    complaint_id: int
    rating: int
    comments: Optional[str] = None


class DashboardStats(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    escalated: int
    closed: int
    sla_breached: int
    avg_resolution_hours: Optional[float]
