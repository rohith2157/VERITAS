"""
Veritas AI & Similarity Engine
High-performance microservice providing document fingerprinting,
evasion detection, cohort collusion matrix, and AI writing forensics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from routers.compare import router as compare_router
from routers.enterprise_architecture import router as enterprise_arch_router

app = FastAPI(
    title="Veritas AI & Similarity Engine",
    description="Universal document integrity, plagiarism detection, and AI writing forensics microservice.",
    version="1.0.0",
)

# Enable CORS for React frontend (port 5173) and Spring Boot backend (port 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(compare_router)
app.include_router(enterprise_arch_router)


@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Service health check and status."""
    return {
        "status": "UP",
        "service": "Veritas AI Engine",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "one_to_one": "/api/v1/compare/one-to-one",
            "many_to_many": "/api/v1/compare/many-to-many",
            "one_to_many": "/api/v1/compare/one-to-many",
            "many_to_one": "/api/v1/compare/many-to-one",
            "ai_forensics": "/api/v1/detect/ai-forensics",
            "code_ast": "/api/v1/detect/code-ast",
            "extract_text": "/api/v1/extract-text",
        },
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
