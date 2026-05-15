from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/", response_model=List[schemas.RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.query(models.Role).all()
