from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def stats(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    total = db.query(models.Document).count()
    status_wise = {
        s.value: db.query(models.Document).filter(models.Document.status == s).count()
        for s in models.DocumentStatus
    }
    avg = db.query(func.avg(models.Document.overall_confidence)).scalar() or 0
    issues = db.query(models.ValidationIssue).filter(models.ValidationIssue.resolved.is_(False)).count()
    anomalies = db.query(models.Document).filter(models.Document.anomaly_flag.is_(True)).count()
    rows = (db.query(models.Document.district_hint, func.count(models.Document.id))
            .filter(models.Document.district_hint.isnot(None))
            .filter(models.Document.district_hint != "")
            .group_by(models.Document.district_hint).all())
    return schemas.DashboardStats(
        total_documents=total,
        processed=status_wise.get("processed", 0),
        pending_review=status_wise.get("needs_review", 0),
        verified=status_wise.get("verified", 0),
        rejected=status_wise.get("rejected", 0),
        average_confidence=round(avg, 2),
        total_validation_issues=issues,
        anomaly_count=anomalies,
        district_wise={r[0]: r[1] for r in rows},
        status_wise=status_wise
    )
