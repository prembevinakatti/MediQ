from fastapi import FastAPI

from app.api.routes.documents import (
    router as documents_router,
)

from app.api.routes.search import (
    router as search_router
)

from app.api.routes.chat import (
    router as chat_router
)

app = FastAPI(
    title="Medical Knowledge RAG API",
    description=(
        "Medical knowledge and education"
        "assistant using RAG"
    ),
    version="0.1.0",
)

app.include_router(
    documents_router
)

app.include_router(
    search_router
)

app.include_router(
    chat_router
)

@app.get("/")
def root():

    return {
        "message" : "Medical RAG API is running"
    }

@app.get("/health")
def health() :

    return {
        "status" : "healthy"
    }