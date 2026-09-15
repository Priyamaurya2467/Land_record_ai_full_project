import os
import datetime
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    Query,
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from .. import models, schemas, auth
from ..database import get_db
from ..config import settings

from ..services.pipeline import (
    process_document,
)


router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


# =========================================================
# HELPERS
# =========================================================

def log(
    db,
    doc_id,
    user_id,
    action,
    details="",
):
    """
    Add an audit record.

    Does NOT commit.
    The caller controls the transaction.
    """

    db.add(
        models.AuditLog(
            document_id=doc_id,
            user_id=user_id,
            action=action,
            details=details,
        )
    )


def load_document(
    db: Session,
    document_id: int,
):
    return (
        db.query(models.Document)
        .options(
            joinedload(
                models.Document.fields
            ),
            joinedload(
                models.Document.issues
            ),
        )
        .filter(
            models.Document.id
            == document_id
        )
        .first()
    )


# =========================================================
# UPLOAD DOCUMENT
# =========================================================

@router.post(
    "/upload",
    response_model=schemas.DocumentOut,
)
def upload_document(
    file: UploadFile = File(...),
    language: str = Form("eng"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.get_current_user
    ),
):

    allowed = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
        ".tif",
        ".tiff",
    }

    filename = file.filename or ""

    ext = os.path.splitext(
        filename
    )[1].lower()

    if ext not in allowed:

        raise HTTPException(
            400,
            "Supported files: PDF, PNG, JPG, JPEG, TIFF",
        )

    allowed_languages = {
        "eng",
        "hin",
        "mar",
        "tam",
        "tel",
        "ben",
        "guj",
        "kan",
        "mal",
        "pan",
        "ori",
    }

    if language not in allowed_languages:

        raise HTTPException(
            400,
            "Unsupported OCR language",
        )

    content = file.file.read()

    max_bytes = (
        settings.max_upload_mb
        * 1024
        * 1024
    )

    if len(content) > max_bytes:

        raise HTTPException(
            413,
            f"File exceeds {settings.max_upload_mb} MB limit",
        )

    # -----------------------------------------------------
    # SAVE FILE
    # -----------------------------------------------------

    safe_filename = (
        f"{datetime.datetime.utcnow().timestamp()}_"
        f"{os.path.basename(filename)}"
    )

    path = (
        settings.upload_path
        / safe_filename
    )

    path.write_bytes(content)

    # -----------------------------------------------------
    # CREATE DOCUMENT
    # -----------------------------------------------------

    doc = models.Document(
        filename=filename,
        stored_path=str(path),
        mime_type=file.content_type,
        language=language,
        uploaded_by=current_user.id,
        latitude=latitude,
        longitude=longitude,
        status=models.DocumentStatus.uploaded,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    # -----------------------------------------------------
    # AUDIT
    # -----------------------------------------------------

    log(
        db,
        doc.id,
        current_user.id,
        "upload",
        f"Uploaded {filename}",
    )

    db.commit()

    # -----------------------------------------------------
    # AI PROCESSING
    # -----------------------------------------------------

    try:

        process_document(
            doc.id,
            db,
        )

    except Exception as exc:

        # Do not expose internal stack traces
        # to the frontend.

        db.rollback()

        doc = (
            db.query(models.Document)
            .filter(
                models.Document.id
                == doc.id
            )
            .first()
        )

        if doc:

            doc.status = (
                models.DocumentStatus.needs_review
            )

            log(
                db,
                doc.id,
                current_user.id,
                "processing_error",
                "AI processing failed. "
                "Document moved to review.",
            )

            db.commit()

        # We return the document to the UI
        # instead of failing the complete upload.

    # -----------------------------------------------------
    # RELOAD
    # -----------------------------------------------------

    doc = load_document(
        db,
        doc.id,
    )

    return doc


# =========================================================
# LIST DOCUMENTS
# =========================================================

@router.get(
    "/",
    response_model=List[
        schemas.DocumentOut
    ],
)
def list_documents(
    status_filter: Optional[str] = Query(
        None
    ),
    search: Optional[str] = Query(
        None
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.get_current_user
    ),
):

    q = db.query(
        models.Document
    )

    if status_filter:

        try:

            q = q.filter(
                models.Document.status
                == models.DocumentStatus(
                    status_filter
                )
            )

        except ValueError:

            raise HTTPException(
                400,
                "Invalid status",
            )

    if search:

        q = q.filter(
            models.Document.filename.ilike(
                f"%{search}%"
            )
        )

    return (
        q.options(
            joinedload(
                models.Document.fields
            ),
            joinedload(
                models.Document.issues
            ),
        )
        .order_by(
            models.Document.uploaded_at.desc()
        )
        .all()
    )


# =========================================================
# REVIEW QUEUE
# =========================================================

@router.get(
    "/queue/review",
    response_model=List[
        schemas.DocumentOut
    ],
)
def review_queue(
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.require_role(
            "admin",
            "verifier",
        )
    ),
):

    return (
        db.query(models.Document)
        .options(
            joinedload(
                models.Document.fields
            ),
            joinedload(
                models.Document.issues
            ),
        )
        .filter(
            models.Document.status
            == models.DocumentStatus.needs_review
        )
        .order_by(
            models.Document.uploaded_at.asc()
        )
        .all()
    )


# =========================================================
# GET SINGLE DOCUMENT
# =========================================================

@router.get(
    "/{document_id}",
    response_model=schemas.DocumentOut,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.get_current_user
    ),
):

    doc = load_document(
        db,
        document_id,
    )

    if not doc:

        raise HTTPException(
            404,
            "Document not found",
        )

    return doc


# =========================================================
# RAW DOCUMENT
# =========================================================

@router.get(
    "/{document_id}/raw"
)
def raw_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.get_current_user
    ),
):

    doc = (
        db.query(models.Document)
        .filter(
            models.Document.id
            == document_id
        )
        .first()
    )

    if not doc:

        raise HTTPException(
            404,
            "Document not found",
        )

    if not os.path.exists(
        doc.stored_path
    ):

        raise HTTPException(
            404,
            "Stored document file not found",
        )

    return FileResponse(
        doc.stored_path,
        media_type=(
            doc.mime_type
            or "application/octet-stream"
        ),
        filename=doc.filename,
    )


# =========================================================
# AUDIT
# =========================================================

@router.get(
    "/{document_id}/audit",
    response_model=List[
        schemas.AuditOut
    ],
)
def audit(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.get_current_user
    ),
):

    exists = (
        db.query(models.Document.id)
        .filter(
            models.Document.id
            == document_id
        )
        .first()
    )

    if not exists:

        raise HTTPException(
            404,
            "Document not found",
        )

    return (
        db.query(models.AuditLog)
        .filter(
            models.AuditLog.document_id
            == document_id
        )
        .order_by(
            models.AuditLog.timestamp.desc()
        )
        .all()
    )


# =========================================================
# VERIFY / REJECT DOCUMENT
# =========================================================

@router.post(
    "/verify",
    response_model=schemas.DocumentOut,
)
def verify(
    payload: schemas.VerificationSubmit,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.require_role(
            "admin",
            "verifier",
        )
    ),
):

    doc = (
        db.query(models.Document)
        .filter(
            models.Document.id
            == payload.document_id
        )
        .first()
    )

    if not doc:

        raise HTTPException(
            404,
            "Document not found",
        )

    # -----------------------------------------------------
    # REJECTION REASON
    # -----------------------------------------------------

    if (
        not payload.approve
        and not (
            payload.rejection_reason
            or ""
        ).strip()
    ):

        raise HTTPException(
            400,
            "Rejection reason is required.",
        )

    # -----------------------------------------------------
    # APPLY CORRECTIONS
    # -----------------------------------------------------

    for correction in payload.corrections:

        field = (
            db.query(
                models.ExtractedField
            )
            .filter(
                models.ExtractedField.id
                == correction.field_id,
                models.ExtractedField.document_id
                == doc.id,
            )
            .first()
        )

        if not field:

            raise HTTPException(
                404,
                (
                    f"Field {correction.field_id} "
                    "does not belong to this document."
                ),
            )

        field.verified_value = (
            correction.corrected_value
        )

        field.is_verified = True

        field.verified_by = (
            current_user.id
        )

        field.verified_at = (
            datetime.datetime.utcnow()
        )

    # -----------------------------------------------------
    # FINAL STATUS
    # -----------------------------------------------------

    now = datetime.datetime.utcnow()

    if payload.approve:

        doc.status = (
            models.DocumentStatus.verified
        )

        doc.verified_at = now

        action = "verify"

        details = (
            "Document verified by human reviewer"
        )

    else:

        doc.status = (
            models.DocumentStatus.rejected
        )

        action = "reject"

        details = (
            payload.rejection_reason
            or "Rejected during verification"
        )

    # -----------------------------------------------------
    # AUDIT
    # -----------------------------------------------------

    log(
        db,
        doc.id,
        current_user.id,
        action,
        details,
    )

    db.commit()

    # -----------------------------------------------------
    # RELOAD
    # -----------------------------------------------------

    return load_document(
        db,
        doc.id,
    )


# =========================================================
# DELETE DOCUMENT
# =========================================================

@router.delete(
    "/{document_id}"
)
def delete(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth.require_role(
            "admin",
            "verifier",
        )
    ),
):

    doc = (
        db.query(models.Document)
        .filter(
            models.Document.id
            == document_id
        )
        .first()
    )

    if not doc:

        raise HTTPException(
            404,
            "Document not found",
        )

    # -----------------------------------------------------
    # REMOVE STORED FILE
    # -----------------------------------------------------

    if os.path.exists(
        doc.stored_path
    ):

        try:
            os.remove(
                doc.stored_path
            )

        except OSError:

            pass

    # -----------------------------------------------------
    # DELETE DATABASE RECORD
    # -----------------------------------------------------

    db.delete(doc)
    db.commit()

    return {
        "detail": "Document deleted",
        "document_id": document_id,
    }