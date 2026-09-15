from typing import Any, Dict, List, Optional
import re


# ---------------------------------------------------------
# REQUIRED LAND-RECORD FIELDS
# ---------------------------------------------------------

REQUIRED_FIELDS = [
    "owner_name",
    "father_or_husband_name",
    "khasra_number",
    "khata_number",
    "village",
    "tehsil",
    "district",
    "state",
    "plot_area",
    "land_classification",
    "document_number",
]


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _clean(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def _normalize(value: Any) -> str:
    """
    Normalize text for comparison.
    """

    value = _clean(value).lower()

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


def _numeric(value: Any) -> Optional[float]:
    """
    Convert an area value to float.
    """

    if value is None:
        return None

    try:
        value = (
            str(value)
            .replace(",", "")
            .replace("sq.ft", "")
            .replace("sq ft", "")
            .replace("sq. ft", "")
            .strip()
        )

        match = re.search(
            r"\d+(?:\.\d+)?",
            value,
        )

        if not match:
            return None

        return float(match.group(0))

    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------
# MAIN VALIDATOR
# ---------------------------------------------------------

def validate_land_record(
    extracted_data: Dict[str, Any],
    reference_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:

    extracted_data = extracted_data or {}
    reference_data = reference_data or {}

    issues: List[Dict[str, Any]] = []

    # -----------------------------------------------------
    # 1. REQUIRED FIELD VALIDATION
    # -----------------------------------------------------

    for field in REQUIRED_FIELDS:

        value = extracted_data.get(field)

        if _clean(value) == "":
            issues.append(
                {
                    "field": field,
                    "type": "MISSING_FIELD",
                    "severity": "high",
                    "message": (
                        f"Required field '{field}' is missing."
                    ),
                }
            )

    # -----------------------------------------------------
    # 2. OWNER NAME VALIDATION
    # -----------------------------------------------------

    owner_name = _clean(
        extracted_data.get("owner_name")
    )

    if owner_name:

        if len(owner_name) < 2:

            issues.append(
                {
                    "field": "owner_name",
                    "type": "INVALID_NAME",
                    "severity": "medium",
                    "message": "Owner name appears invalid.",
                }
            )

        elif not re.search(
            r"[A-Za-z\u0900-\u097F]",
            owner_name,
        ):

            issues.append(
                {
                    "field": "owner_name",
                    "type": "INVALID_NAME",
                    "severity": "medium",
                    "message": (
                        "Owner name must contain alphabetic "
                        "characters."
                    ),
                }
            )

    # -----------------------------------------------------
    # 3. FATHER / HUSBAND NAME
    # -----------------------------------------------------

    parent_name = _clean(
        extracted_data.get(
            "father_or_husband_name"
        )
    )

    if parent_name and len(parent_name) < 2:

        issues.append(
            {
                "field": "father_or_husband_name",
                "type": "INVALID_NAME",
                "severity": "medium",
                "message": (
                    "Father/Husband name appears invalid."
                ),
            }
        )

    # -----------------------------------------------------
    # 4. PLOT AREA VALIDATION
    # -----------------------------------------------------

    area_value = extracted_data.get(
        "plot_area"
    )

    if _clean(area_value):

        area = _numeric(area_value)

        if area is None:

            issues.append(
                {
                    "field": "plot_area",
                    "type": "INVALID_AREA",
                    "severity": "high",
                    "message": (
                        "Plot area is not a valid "
                        "numeric value."
                    ),
                }
            )

        elif area <= 0:

            issues.append(
                {
                    "field": "plot_area",
                    "type": "INVALID_AREA",
                    "severity": "high",
                    "message": (
                        "Plot area must be greater than zero."
                    ),
                }
            )

    # -----------------------------------------------------
    # 5. KHASRA VALIDATION
    # -----------------------------------------------------

    khasra = _clean(
        extracted_data.get(
            "khasra_number"
        )
    )

    if khasra:

        if not re.fullmatch(
            r"[A-Za-z0-9\u0900-\u097F/\\\-_]+",
            khasra,
        ):

            issues.append(
                {
                    "field": "khasra_number",
                    "type": "INVALID_KHASRA",
                    "severity": "medium",
                    "message": (
                        "Khasra number contains "
                        "unexpected characters."
                    ),
                }
            )

    # -----------------------------------------------------
    # 6. KHATA VALIDATION
    # -----------------------------------------------------

    khata = _clean(
        extracted_data.get(
            "khata_number"
        )
    )

    if khata:

        if not re.fullmatch(
            r"[A-Za-z0-9\u0900-\u097F/\\\-_]+",
            khata,
        ):

            issues.append(
                {
                    "field": "khata_number",
                    "type": "INVALID_KHATA",
                    "severity": "medium",
                    "message": (
                        "Khata number contains "
                        "unexpected characters."
                    ),
                }
            )

    # -----------------------------------------------------
    # 7. DOCUMENT NUMBER
    # -----------------------------------------------------

    document_number = _clean(
        extracted_data.get(
            "document_number"
        )
    )

    if document_number:

        if len(document_number) < 2:

            issues.append(
                {
                    "field": "document_number",
                    "type": "INVALID_DOCUMENT_NUMBER",
                    "severity": "medium",
                    "message": (
                        "Document number appears invalid."
                    ),
                }
            )

    # -----------------------------------------------------
    # 8. REFERENCE RECORD COMPARISON
    # -----------------------------------------------------

    comparison_fields = [
        "owner_name",
        "father_or_husband_name",
        "khasra_number",
        "khata_number",
        "village",
        "tehsil",
        "district",
        "state",
        "land_classification",
        "document_number",
    ]

    for field in comparison_fields:

        extracted_value = _clean(
            extracted_data.get(field)
        )

        reference_value = _clean(
            reference_data.get(field)
        )

        if (
            extracted_value
            and reference_value
        ):

            if (
                _normalize(extracted_value)
                != _normalize(reference_value)
            ):

                issues.append(
                    {
                        "field": field,
                        "type": "MISMATCH",
                        "severity": "high",
                        "message": (
                            f"{field.replace('_', ' ').title()} "
                            "does not match the reference record."
                        ),
                        "extracted_value": extracted_value,
                        "reference_value": reference_value,
                    }
                )

    # -----------------------------------------------------
    # 9. AREA REFERENCE COMPARISON
    # -----------------------------------------------------

    extracted_area = _numeric(
        extracted_data.get(
            "plot_area"
        )
    )

    reference_area = _numeric(
        reference_data.get(
            "plot_area"
        )
    )

    if (
        extracted_area is not None
        and reference_area is not None
    ):

        tolerance = max(
            reference_area * 0.02,
            0.01,
        )

        if (
            abs(
                extracted_area
                - reference_area
            )
            > tolerance
        ):

            issues.append(
                {
                    "field": "plot_area",
                    "type": "AREA_MISMATCH",
                    "severity": "high",
                    "message": (
                        "Plot area differs from "
                        "the reference record."
                    ),
                    "extracted_value": extracted_area,
                    "reference_value": reference_area,
                }
            )

    # -----------------------------------------------------
    # 10. FINAL STATUS
    # -----------------------------------------------------

    high_issues = [
        issue
        for issue in issues
        if issue.get("severity") == "high"
    ]

    medium_issues = [
        issue
        for issue in issues
        if issue.get("severity") == "medium"
    ]

    if not issues:

        status = "VALID"

    elif high_issues:

        status = "INVALID"

    else:

        status = "REVIEW"

    # -----------------------------------------------------
    # 11. CONFIDENCE SCORE
    # -----------------------------------------------------

    total_fields = len(REQUIRED_FIELDS)

    missing_fields = len(
        [
            issue
            for issue in issues
            if issue.get("type")
            == "MISSING_FIELD"
        ]
    )

    mismatch_count = len(
        [
            issue
            for issue in issues
            if issue.get("type")
            in [
                "MISMATCH",
                "AREA_MISMATCH",
            ]
        ]
    )

    invalid_count = len(
        [
            issue
            for issue in issues
            if issue.get("type")
            not in [
                "MISSING_FIELD",
                "MISMATCH",
                "AREA_MISMATCH",
            ]
        ]
    )

    confidence = 100.0

    # Missing fields have the strongest impact.
    confidence -= (
        missing_fields
        / max(total_fields, 1)
    ) * 45

    # Reference mismatches are important.
    confidence -= mismatch_count * 10

    # Other validation problems.
    confidence -= invalid_count * 5

    confidence = round(
        max(
            0.0,
            min(
                100.0,
                confidence,
            ),
        ),
        2,
    )

    # -----------------------------------------------------
    # 12. RESULT MESSAGE
    # -----------------------------------------------------

    if status == "VALID":

        message = (
            "Land record successfully validated."
        )

    elif status == "INVALID":

        message = (
            "Land record contains validation conflicts."
        )

    else:

        message = (
            "Land record requires human verification."
        )

    # -----------------------------------------------------
    # 13. RETURN RESULT
    # -----------------------------------------------------

    return {
        "status": status,
        "confidence": confidence,
        "message": message,
        "issues": issues,
        "errors": issues,
        "summary": {
            "total_fields": total_fields,
            "missing_fields": missing_fields,
            "high_issues": len(high_issues),
            "medium_issues": len(medium_issues),
            "mismatches": mismatch_count,
        },
    }