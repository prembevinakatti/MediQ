from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import generate_rag_response

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

class ChatRequest(BaseModel): 

    question: str

    top_k: int = 3

@router.post("/")
def chat(request: ChatRequest):

    result = generate_rag_response(
        question=request.question,
        top_k=request.top_k
    )

    return result