from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, auth, biometrics, ministry, regions, results, storage, teacher

app = FastAPI(title="EduAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(teacher.router)
app.include_router(results.router)
app.include_router(regions.router)
app.include_router(admin.router)
app.include_router(ministry.router)
app.include_router(biometrics.router)
app.include_router(storage.router)


@app.get("/health")
def health():
    return {"status": "ok"}
