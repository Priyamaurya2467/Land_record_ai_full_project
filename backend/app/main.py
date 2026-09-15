from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from . import models, auth
from .config import settings
from .routers import auth as auth_router, documents, dashboard, gis

@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        demo = [
            ("admin", "admin123", "System Administrator", models.UserRole.admin),
            ("verifier", "verifier123", "Revenue Verifier", models.UserRole.verifier),
            ("viewer", "viewer123", "Citizen Viewer", models.UserRole.viewer),
        ]
        for username, password, full_name, role in demo:
            if not db.query(models.User).filter(models.User.username == username).first():
                db.add(models.User(
                    username=username,
                    hashed_password=auth.get_password_hash(password),
                    full_name=full_name,
                    role=role
                ))
        db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.app_name,
    description="AI-assisted digitization, validation, verification and GIS-ready management of legacy land records.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
     CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_list,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

app.include_router(auth_router.router)
app.include_router(documents.router)
app.include_router(dashboard.router)
app.include_router(gis.router)

@app.get("/")
def root():
    return {
        "message": "Land Record AI API is running",
        "docs": "/docs",
        "features": ["OCR", "field extraction", "validation", "anomaly detection", "human verification", "audit", "GIS"]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
