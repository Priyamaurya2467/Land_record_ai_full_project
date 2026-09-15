from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from .. import models
from .ocr import run_ocr
from .extractor import extract_fields
from .validator import validate_land_record
from .hashing import sha256_file


def normalize_extracted_data(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts this:

    {
        "owner_name": {
            "value": "Priya",
            "confidence": 85
        }
    }

    into:

    {
        "owner_name": "Priya"
    }
    """

    normalized = {}

    for field_name, data in extracted_data.items():
        if isinstance(data, dict):
            normalized[field_name] = data.get("value", "")
        else:
            normalized[field_name] = data

    return normalized


def calculate_extraction_confidence(
    extracted_data: Dict[str, Any],
) -> float:
    scores = []

    for data in extracted_data.values():
        if not isinstance(data, dict):
            continue

        value = data.get("value")
        confidence = data.get("confidence")

        if value and confidence is not None:
            try:
                scores.append(float(confidence))
            except (TypeError, ValueError):
                continue

    if not scores:
        return 0.0

    return round(sum(scores) / len(scores), 2)


def process_land_record(
    extracted_data: Dict[str, Any],
    reference_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Runs validation on already extracted land-record data.
    """

    normalized_data = normalize_extracted_data(extracted_data)

    validation_result = validate_land_record(
        extracted_data=normalized_data,
        reference_data=reference_data,
    )

    extraction_confidence = calculate_extraction_confidence(
        extracted_data
    )

    validation_confidence = float(
        validation_result.get("confidence", 0)
    )

    if extraction_confidence > 0:
        overall_confidence = (
            extraction_confidence + validation_confidence
        ) / 2
    else:
        overall_confidence = validation_confidence

    overall_confidence = round(
        max(0, min(100, overall_confidence)),
        2,
    )

    status = validation_result.get("status", "REVIEW")

    if overall_confidence < 70 and status == "VALID":
        status = "REVIEW"

    return {
        "extracted_data": normalized_data,
        "validation": validation_result,
        "status": status,
        "confidence": overall_confidence,
        "extraction_confidence": extraction_confidence,
        "validation_confidence": validation_confidence,
        "issues": validation_result.get("issues", []),
    }


def process_document(
    document_id: int,
    db: Session,
) -> models.Document:
    """
    Complete document-processing pipeline:

    1. Load document
    2. Calculate SHA-256 hash
    3. Run OCR
    4. Extract fields
    5. Validate fields
    6. Save extracted fields
    7. Save validation issues
    8. Update document status
    """

    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )

    if not document:
        raise ValueError("Document not found.")

    try:
        # Mark document as processing
        document.status = models.DocumentStatus.processing
        db.commit()

        # Calculate file hash
        document.sha256 = sha256_file(document.stored_path)

        # Run OCR
        raw_text, ocr_confidence = run_ocr(
            document.stored_path,
            lang=document.language,
        )

        document.raw_text = raw_text

        # Extract fields from OCR text
        extracted_fields = extract_fields(
            text=raw_text,
            ocr_confidence=ocr_confidence,
        )

        # Validate extracted fields
        result = process_land_record(
            extracted_data=extracted_fields,
            reference_data=None,
        )

        # Remove old extracted fields if reprocessing
        for existing_field in list(document.fields):
            db.delete(existing_field)

        db.flush()

        # Save newly extracted fields
        for field_name, field_data in extracted_fields.items():
            if not isinstance(field_data, dict):
                continue

            value = field_data.get("value", "")
            confidence = field_data.get("confidence", 0)

            extracted_field = models.ExtractedField(
                document_id=document.id,
                field_name=field_name,
                field_value=(
                    str(value) if value is not None else ""
                ),
                confidence=float(confidence),
                is_verified=False,
            )

            db.add(extracted_field)

        # Remove old validation issues if reprocessing
        for existing_issue in list(document.issues):
            db.delete(existing_issue)

        db.flush()

        # Save validation issues
        for issue_data in result.get("issues", []):
            if not isinstance(issue_data, dict):
                continue

            issue = models.ValidationIssue(
                document_id=document.id,
                field_name=(
                    issue_data.get("field")
                    or issue_data.get("field_name")
                ),
                issue_type=issue_data.get(
                    "type",
                    "VALIDATION",
                ),
                severity=issue_data.get(
                    "severity",
                    "medium",
                ),
                message=issue_data.get(
                    "message",
                    "Validation issue detected.",
                ),
                resolved=False,
            )

            db.add(issue)

        # Update document confidence
        document.overall_confidence = result.get(
            "confidence",
            0,
        )

        # Keep processed documents available for review
        result_status = result.get("status", "REVIEW")

        if result_status == "VALID":
            document.status = models.DocumentStatus.processed
        else:
            document.status = models.DocumentStatus.needs_review

        document.processed_at = datetime.utcnow()

        db.commit()
        db.refresh(document)

        return document

    except Exception:
        db.rollback()

        # Try to mark failed processing for review
        failed_document = (
            db.query(models.Document)
            .filter(models.Document.id == document_id)
            .first()
        )

        if failed_document:
            failed_document.status = (
                models.DocumentStatus.needs_review
            )
            db.commit()

        raise