from typing import Dict, Any


def normalize(value: Any) -> str:
    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
        .replace(" ", "")
        .replace("-", "")
    )


def create_land_record_key(record: Dict[str, Any]) -> str:

    owner = normalize(record.get("owner_name"))
    khasra = normalize(record.get("khasra_number"))
    khata = normalize(record.get("khata_number"))
    village = normalize(record.get("village"))

    return f"{owner}|{khasra}|{khata}|{village}"


def compare_records(
    record1: Dict[str, Any],
    record2: Dict[str, Any],
) -> Dict[str, Any]:

    fields = [
        "owner_name",
        "khasra_number",
        "khata_number",
        "village",
        "tehsil",
        "district",
    ]

    matched = 0

    for field in fields:

        value1 = normalize(record1.get(field))
        value2 = normalize(record2.get(field))

        if value1 and value2 and value1 == value2:
            matched += 1

    similarity = round((matched / len(fields)) * 100, 2)

    return {
        "is_duplicate": similarity >= 80,
        "similarity": similarity,
        "matched_fields": matched,
        "total_fields": len(fields),
    }