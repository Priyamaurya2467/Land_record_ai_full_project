import re
from typing import Dict, Any


# ---------------------------------------------------------
# FIELD LABELS
# ---------------------------------------------------------

FIELD_LABELS = {
    "owner_name": [
        r"owner\s*name",
        r"land\s*owner",
        r"name\s*of\s*owner",
        r"khatedar",
        r"भूमि\s*स्वामी",
        r"नाम",
    ],

    "father_or_husband_name": [
        r"father\s*name",
        r"father\s*/\s*husband",
        r"father\s*or\s*husband",
        r"husband\s*name",
        r"पिता\s*का\s*नाम",
        r"पति\s*का\s*नाम",
    ],

    "survey_number": [
        r"survey\s*(?:no|number)",
        r"s\.?\s*no\.?",
        r"survey",
        r"सर्वे\s*(?:नं|नंबर)?",
    ],

    "khasra_number": [
        r"khasra\s*(?:no|number)?",
        r"खसरा\s*(?:नं|नंबर)?",
    ],

    "khata_number": [
        r"khata\s*(?:no|number)?",
        r"account\s*(?:no|number)",
        r"खाता\s*(?:नं|नंबर)?",
    ],

    "plot_area": [
        r"plot\s*area",
        r"land\s*area",
        r"area",
        r"rakba",
        r"क्षेत्रफल",
        r"रकबा",
    ],

    "village": [
        r"village",
        r"gram",
        r"gaon",
        r"गाँव",
        r"गांव",
        r"ग्राम",
    ],

    "tehsil": [
        r"tehsil",
        r"taluka",
        r"block",
        r"तहसील",
        r"तालुका",
        r"ब्लॉक",
    ],

    "district": [
        r"district",
        r"zilla",
        r"जिला",
    ],

    "state": [
        r"state",
        r"राज्य",
    ],

    "land_classification": [
        r"land\s*classification",
        r"land\s*class",
        r"land\s*type",
        r"category\s*of\s*land",
        r"भूमि\s*प्रकार",
        r"भूमि\s*श्रेणी",
    ],

    "mutation_number": [
        r"mutation\s*(?:no|number)?",
        r"dakhil\s*kharij",
        r"दाखिल\s*खारिज",
        r"म्यूटेशन",
    ],

    "registration_number": [
        r"registration\s*(?:no|number)?",
        r"reg\.?\s*no\.?",
        r"document\s*(?:no|number)",
        r"पंजीकरण\s*(?:संख्या|नं|नंबर)?",
    ],

    "registration_date": [
        r"registration\s*date",
        r"date\s*of\s*registration",
        r"पंजीकरण\s*तिथि",
    ],

    "document_number": [
        r"document\s*(?:no|number)",
        r"doc\.?\s*(?:no|number)",
        r"दस्तावेज\s*(?:संख्या|नं|नंबर)?",
    ],

    "document_date": [
        r"document\s*date",
        r"date\s*of\s*document",
        r"दस्तावेज\s*तिथि",
    ],
}


# Fields where OCR is expected to contain an identifier.
ID_FIELDS = {
    "survey_number",
    "khasra_number",
    "khata_number",
    "mutation_number",
    "registration_number",
    "document_number",
}


# ---------------------------------------------------------
# TEXT CLEANING
# ---------------------------------------------------------

def clean_text(value: str) -> str:
    """
    General cleanup for OCR text.
    """

    if not value:
        return ""

    value = value.replace("\r", "\n")

    # Collapse multiple spaces.
    value = re.sub(r"[ \t]+", " ", value)

    # Remove excessive blank lines.
    value = re.sub(r"\n{2,}", "\n", value)

    return value.strip()


def clean(field: str, raw: str) -> str:
    """
    Clean an extracted field value.
    """

    if not raw:
        return ""

    value = raw.strip(" \t\r\n.:-|")

    # Only use the first OCR line.
    value = value.split("\n")[0].strip()

    # Remove repeated spaces.
    value = re.sub(r"\s+", " ", value)

    # -----------------------------------------------------
    # ID fields
    # -----------------------------------------------------

    if field in ID_FIELDS:

        match = re.search(
            r"[A-Za-z0-9\u0900-\u097F]+(?:[A-Za-z0-9\u0900-\u097F/\\\-_]*)",
            value,
        )

        if match:
            return match.group(0).strip()

        return value[:80]

    # -----------------------------------------------------
    # AREA
    # -----------------------------------------------------

    if field == "plot_area":

        match = re.search(
            r"\d+(?:\.\d+)?",
            value,
        )

        if match:
            return match.group(0)

        return value[:40]

    # -----------------------------------------------------
    # DATES
    # -----------------------------------------------------

    if field in {
        "registration_date",
        "document_date",
    }:

        match = re.search(
            r"\d{1,4}[\-/\.]\d{1,2}[\-/\.]\d{1,4}",
            value,
        )

        if match:
            return match.group(0)

        return value[:40]

    # -----------------------------------------------------
    # NORMAL TEXT
    # -----------------------------------------------------

    return value[:160]


# ---------------------------------------------------------
# CONFIDENCE
# ---------------------------------------------------------

def confidence(
    field: str,
    value: str,
    ocr_confidence: float,
) -> float:
    """
    Calculate field-level confidence.

    OCR confidence is combined with simple
    field-format checks.
    """

    if not value:
        return 0.0

    try:
        score = float(ocr_confidence)
    except (TypeError, ValueError):
        score = 55.0

    if score <= 0:
        score = 55.0

    # Very short values are suspicious.
    if len(value.strip()) < 2:
        score -= 20

    # -----------------------------------------------------
    # Area validation
    # -----------------------------------------------------

    if field == "plot_area":

        if not re.fullmatch(
            r"\d+(?:\.\d+)?",
            value,
        ):
            score -= 25

    # -----------------------------------------------------
    # ID validation
    # -----------------------------------------------------

    if field in ID_FIELDS:

        if not re.fullmatch(
            r"[A-Za-z0-9\u0900-\u097F/\\\-_]+",
            value,
        ):
            score -= 15

    # -----------------------------------------------------
    # Date validation
    # -----------------------------------------------------

    if field in {
        "registration_date",
        "document_date",
    }:

        if not re.search(
            r"\d{1,4}[\-/\.]\d{1,2}[\-/\.]\d{1,4}",
            value,
        ):
            score -= 15

    # -----------------------------------------------------
    # Name validation
    # -----------------------------------------------------

    if field in {
        "owner_name",
        "father_or_husband_name",
    }:

        if not re.search(
            r"[A-Za-z\u0900-\u097F]",
            value,
        ):
            score -= 20

    return round(
        max(0.0, min(100.0, score)),
        2,
    )


# ---------------------------------------------------------
# VALUE EXTRACTION
# ---------------------------------------------------------

def extract_value_after_label(
    text: str,
    label: str,
) -> str:
    """
    Find the value immediately following a field label.

    Example:

        Owner Name: Ram Singh

    returns:

        Ram Singh
    """

    pattern = re.compile(
        label
        + r"\s*"
        + r"(?:[:\-]|is)?"
        + r"\s*"
        + r"([^\n|;]+)",
        re.IGNORECASE,
    )

    match = pattern.search(text)

    if not match:
        return ""

    return match.group(1).strip()


# ---------------------------------------------------------
# MAIN EXTRACTION FUNCTION
# ---------------------------------------------------------

def extract_fields(
    text: str,
    ocr_confidence: float = 0.0,
) -> Dict[str, Dict[str, Any]]:
    """
    Extract structured land-record fields from OCR text.

    Returns:

    {
        "owner_name": {
            "value": "Ram Singh",
            "confidence": 91.5
        },
        ...
    }
    """

    if not text:
        return {
            field: {
                "value": "",
                "confidence": 0.0,
            }
            for field in FIELD_LABELS
        }

    text = clean_text(text)

    results: Dict[str, Dict[str, Any]] = {}

    for field, labels in FIELD_LABELS.items():

        value = ""

        for label in labels:

            candidate = extract_value_after_label(
                text,
                label,
            )

            candidate = clean(
                field,
                candidate,
            )

            if candidate:
                value = candidate
                break

        results[field] = {
            "value": value,
            "confidence": confidence(
                field=field,
                value=value,
                ocr_confidence=ocr_confidence,
            ),
        }

    return results


# ---------------------------------------------------------
# SIMPLE DICTIONARY VERSION
# ---------------------------------------------------------

def extract_values(
    text: str,
    ocr_confidence: float = 0.0,
) -> Dict[str, Any]:
    """
    Return only field values.

    Useful for validation.

    Example:

    {
        "owner_name": "Ram Singh",
        "khasra_number": "123/4",
        ...
    }
    """

    extracted = extract_fields(
        text=text,
        ocr_confidence=ocr_confidence,
    )

    return {
        field: data["value"]
        for field, data in extracted.items()
    }


# ---------------------------------------------------------
# EXTRACTION SUMMARY
# ---------------------------------------------------------

def extraction_summary(
    extracted_data: Dict[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generate extraction statistics for the dashboard.
    """

    total_fields = len(extracted_data)

    extracted_fields = sum(
        1
        for data in extracted_data.values()
        if data.get("value")
    )

    confidences = [
        float(data.get("confidence", 0))
        for data in extracted_data.values()
        if data.get("value")
    ]

    average_confidence = (
        sum(confidences) / len(confidences)
        if confidences
        else 0.0
    )

    return {
        "total_fields": total_fields,
        "extracted_fields": extracted_fields,
        "missing_fields": total_fields - extracted_fields,
        "average_confidence": round(
            average_confidence,
            2,
        ),
    }