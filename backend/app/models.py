import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


# ============================================================
# ENUMS
# ============================================================

class UserRole(str, enum.Enum):
    admin = "admin"
    verifier = "verifier"
    viewer = "viewer"


class DocumentStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    processed = "processed"
    needs_review = "needs_review"
    verified = "verified"
    rejected = "rejected"


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    username = Column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password = Column(
        String(256),
        nullable=False,
    )

    role = Column(
        Enum(UserRole),
        default=UserRole.viewer,
        nullable=False,
    )

    full_name = Column(String(128))

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# DOCUMENT
# ============================================================

class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename = Column(
        String(256),
        nullable=False,
    )

    stored_path = Column(
        String(512),
        nullable=False,
    )

    mime_type = Column(String(128))

    language = Column(
        String(16),
        default="eng",
    )

    status = Column(
        Enum(DocumentStatus),
        default=DocumentStatus.uploaded,
    )

    raw_text = Column(Text)

    overall_confidence = Column(
        Float,
        default=0.0,
    )

    anomaly_score = Column(
        Float,
        default=0.0,
    )

    anomaly_flag = Column(
        Boolean,
        default=False,
    )

    sha256 = Column(
        String(64),
        index=True,
    )

    district_hint = Column(
        String(128),
    )

    latitude = Column(Float)

    longitude = Column(Float)

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    processed_at = Column(DateTime)

    verified_at = Column(DateTime)

    # Relationships
    fields = relationship(
        "ExtractedField",
        back_populates="document",
        cascade="all, delete-orphan",
    )

    issues = relationship(
        "ValidationIssue",
        back_populates="document",
        cascade="all, delete-orphan",
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="document",
        cascade="all, delete-orphan",
    )


# ============================================================
# EXTRACTED FIELD
# ============================================================

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(
        Integer,
        primary_key=True,
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False,
    )

    field_name = Column(
        String(64),
        nullable=False,
    )

    field_value = Column(Text)

    confidence = Column(
        Float,
        default=0.0,
    )

    is_verified = Column(
        Boolean,
        default=False,
    )

    verified_value = Column(Text)

    verified_by = Column(
        Integer,
        ForeignKey("users.id"),
    )

    verified_at = Column(DateTime)

    document = relationship(
        "Document",
        back_populates="fields",
    )


# ============================================================
# VALIDATION ISSUE
# ============================================================

class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(
        Integer,
        primary_key=True,
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False,
    )

    field_name = Column(String(64))

    issue_type = Column(
        String(64),
        nullable=False,
    )

    severity = Column(
        String(16),
        default="medium",
    )

    message = Column(
        String(512),
        nullable=False,
    )

    resolved = Column(
        Boolean,
        default=False,
    )

    document = relationship(
        "Document",
        back_populates="issues",
    )


# ============================================================
# AUDIT LOG
# ============================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    action = Column(
        String(128),
        nullable=False,
    )

    details = Column(Text)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
    )

    document = relationship(
        "Document",
        back_populates="audit_logs",
    )