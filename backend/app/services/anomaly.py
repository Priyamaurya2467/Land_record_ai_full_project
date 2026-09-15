def anomaly_score(values, issues, ocr_confidence):
    score = 0.0
    if ocr_confidence < 50:
        score += 0.35
    if not values.get("owner_name"):
        score += 0.20
    if not values.get("survey_number"):
        score += 0.15
    if not values.get("village"):
        score += 0.10
    if any(i[1] == "possible_duplicate" for i in issues):
        score += 0.35
    if any(i[1] == "suspicious_value" for i in issues):
        score += 0.15
    return round(min(score, 1.0), 3)
