from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/gis", tags=["gis"])

@router.get("/records", response_model=list[schemas.MapRecord])
def records(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    docs = (db.query(models.Document)
            .filter(models.Document.latitude.isnot(None), models.Document.longitude.isnot(None))
            .order_by(models.Document.uploaded_at.desc()).all())
    return [
        schemas.MapRecord(
            id=d.id,
            filename=d.filename,
            district=d.district_hint,
            latitude=d.latitude,
            longitude=d.longitude,
            status=d.status.value,
            confidence=d.overall_confidence,
            anomaly_flag=d.anomaly_flag
        ) for d in docs
    ]
