# Land Record AI — Intelligent Digitization & Validation Platform

A hackathon-ready full-stack implementation for the **Intelligent Land Record Digitization and Validation System**.

## What it implements

- JWT authentication with `admin`, `verifier`, and `viewer` roles
- Upload scanned PDF/image land records
- Multilingual OCR using Tesseract
- Rule-based structured field extraction designed for easy replacement by NER/Transformers
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
- Modern React dashboard UI
- Demo mode that works with SQLite

The architecture follows the supplied problem statement: legacy document processing, structured extraction, validation, confidence scoring, human verification, LRMS/GIS integration points, secure repository/audit trails, dashboards, APIs, and role-based access.

## Project structure

land_record_ai/
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
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── _layout.jsx
│   │   │   ├── index.jsx
│   │   │   ├── login.jsx
│   │   │   ├── register.jsx
│   │   │   ├── dashboard.jsx
│   │   │   ├── demo.jsx
│   │   │   ├── upload.jsx
│   │   │   ├── records.jsx
│   │   │   └── profile.jsx
│   │   ├── components/
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   └── services/
│   │       └── api.js
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── babel.config.js
│
├── sample_data/
├── docker-compose.yml
└── README.md

## Backend setup

### 1. Install Tesseract + Poppler

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-hin tesseract-ocr-mar \
  tesseract-ocr-tam tesseract-ocr-tel tesseract-ocr-ben \
  tesseract-ocr-guj tesseract-ocr-kan tesseract-ocr-mal \
  tesseract-ocr-pan tesseract-ocr-ori poppler-utils
```

Windows:
- Install Tesseract OCR.
- Install Poppler.
- Put their `bin` directories on PATH.



### 2. Python environment

```bash
cd backend
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows
# .venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Run FastAPI backend

```powershell
cd E:\land_record_ai_full_project\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Backend URLs

```text
API:      http://127.0.0.1:8000
Swagger:  http://127.0.0.1:8000/docs
Health:   http://127.0.0.1:8000/health
```

### Demo users

The application creates these users on startup:

| Username | Password | Role |
|---|---|---|
| admin | admin123 | admin |
| verifier | verifier123 | verifier |
| viewer | viewer123 | viewer |

Change these before production.

## Frontend setup

```powershell
cd E:\land_record_ai_full_project\frontend
npx expo start



For Android Emulator:

```markdown
```powershell
cd E:\land_record_ai_full_project\frontend
npx expo start --android


For Web:

```markdown
```powershell
cd E:\land_record_ai_full_project\frontend
npx expo start --web
```

Open the Vite URL, normally:

```text
http://localhost:5173
```

## Docker

```bash
docker compose up --build
```

## Demo flow

1. Open the Anvexa Manthan landing page.
2. Explore the project overview and AI workflow.
3. Open the interactive AI demo.
4. Follow the simulated land-record processing pipeline:

   - Upload historical land record
   - AI document detection
   - Multilingual OCR
   - Field extraction
   - Confidence scoring
   - Rule-based validation
   - Conflict detection
   - AI explanation
   - Human correction
   - Record verification
   - GIS intelligence
   - Verified digital record

5. Select **Sign In** or **Get Started**.
6. Register a new account or log in.
7. Open the dashboard.
8. Upload a land-record PDF or image.
9. Select the OCR language.
10. The backend performs:

    - OCR
    - Field extraction
    - Confidence scoring
    - Validation
    - Duplicate detection
    - Anomaly scoring
    - SHA-256 hashing

11. Low-confidence or invalid records enter the verification queue.
12. Open the records section.
13. Review and verify extracted information.
14. View available GIS information.
15. Monitor processing statistics from the dashboard.

## Frontend screens

The Expo frontend contains the following screens:

| Screen | Route | Purpose |
|---|---|---|
| Landing Page | `/` | Product introduction, features, workflow and demo |
| Login | `/login` | User authentication |
| Register | `/register` | New account registration |
| Dashboard | `/dashboard` | Land-record intelligence overview |
| AI Demo | `/demo` | Interactive simulated AI processing workflow |
| Uploads | `/upload` | Upload scanned land records |
| Records | `/records` | View and manage digitized records |
| Profile | `/profile` | View user profile and account information |

### Dashboard navigation

The dashboard sidebar contains only:

1. Dashboard
2. Uploads
3. Records
4. Profile

Additional capabilities such as AI processing, GIS intelligence, analytics, validation and audit information are available through dashboard cards and actions.


## Frontend screens

The Expo frontend contains the following screens:

| Screen | Route | Purpose |
|---|---|---|
| Landing Page | `/` | Product introduction, features, workflow and demo |
| Login | `/login` | User authentication |
| Register | `/register` | New account registration |
| Dashboard | `/dashboard` | Land-record intelligence overview |
| AI Demo | `/demo` | Interactive simulated AI processing workflow |
| Uploads | `/upload` | Upload scanned land records |
| Records | `/records` | View and manage digitized records |
| Profile | `/profile` | View user profile and account information |

### Dashboard navigation

The dashboard sidebar contains only:

1. Dashboard
2. Uploads
3. Records
4. Profile

Additional capabilities such as AI processing, GIS intelligence, analytics, validation and audit information are available through dashboard cards and actions.



## Production upgrades

For a production deployment:
- PostgreSQL + PostGIS instead of SQLite
- Redis + Celery/RQ for asynchronous OCR
- object storage instead of local uploads
- real NER model such as LayoutLM/Indic-compatible transformer
- official state registry/LRMS APIs
- digitally signed records
- Hyperledger/Ethereum network where legally appropriate
- KMS/secret manager
- virus scanning and file-type validation
- rate limiting
- HTTPS and restricted CORS
- immutable audit-log storage
- state-specific validation rules
