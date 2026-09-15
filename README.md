# Land Record AI — Intelligent Digitization & Validation Platform

A hackathon-ready full-stack implementation for the **Intelligent Land Record Digitization and Validation System**.

## What it implements

- JWT authentication with `admin`, `verifier`, and `viewer` roles
- Upload scanned PDF/image land records
- Multilingual OCR using Tesseract
- Rule-based structured field extraction
- Confidence scoring
- Business-rule validation
- Duplicate survey-number detection
- Human-in-the-loop verification queue
- Audit trail
- Analytics dashboard
- District/status statistics
- GIS-ready coordinates and map view
- Tamper-evident SHA-256 document hashing
- Optional IPFS/Blockchain integration hooks
- REST API with Swagger/OpenAPI
- Modern React Native/Expo dashboard UI
- Demo mode with SQLite

The architecture follows the supplied problem statement: legacy document processing, structured extraction, validation, confidence scoring, human verification, LRMS/GIS integration points, secure repository/audit trails, dashboards, APIs, and role-based access.

---

## Project Structure

```text
land_record_ai_full_project/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── services/
│   │   │   ├── ocr.py
│   │   │   ├── extractor.py
│   │   │   ├── validator.py
│   │   │   ├── anomaly.py
│   │   │   ├── hashing.py
│   │   │   └── pipeline.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── documents.py
│   │       ├── dashboard.py
│   │       └── gis.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── package-lock.json
│
├── sample_data/
├── docker-compose.yml
├── .gitignore
└── README.md