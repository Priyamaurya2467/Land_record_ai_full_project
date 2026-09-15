from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "viewer"

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    full_name: Optional[str] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class FieldOut(BaseModel):
    id: int
    field_name: str
    field_value: Optional[str] = None
    confidence: float
    is_verified: bool
    verified_value: Optional[str] = None
    class Config:
        from_attributes = True

class IssueOut(BaseModel):
    id: int
    field_name: Optional[str] = None
    issue_type: str
    severity: str
    message: str
    resolved: bool
    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: int
    filename: str
    language: str
    status: str
    overall_confidence: float
    anomaly_score: float
    anomaly_flag: bool
    sha256: Optional[str]
    district_hint: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    uploaded_at: datetime
    processed_at: Optional[datetime]
    verified_at: Optional[datetime]
    fields: List[FieldOut] = []
    issues: List[IssueOut] = []
    class Config:
        from_attributes = True

class FieldCorrection(BaseModel):
    field_id: int
    corrected_value: str

class VerificationSubmit(BaseModel):
    document_id: int
    corrections: List[FieldCorrection] = []
    approve: bool = True
    rejection_reason: Optional[str] = None

class DashboardStats(BaseModel):
    total_documents: int
    processed: int
    pending_review: int
    verified: int
    rejected: int
    average_confidence: float
    total_validation_issues: int
    anomaly_count: int
    district_wise: Dict[str, int]
    status_wise: Dict[str, int]

class MapRecord(BaseModel):
    id: int
    filename: str
    district: Optional[str]
    latitude: float
    longitude: float
    status: str
    confidence: float
    anomaly_flag: bool

class AuditOut(BaseModel):
    id: int
    action: str
    details: Optional[str]
    timestamp: datetime
    user_id: Optional[int]
    class Config:
        from_attributes = True
