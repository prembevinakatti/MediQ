from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel
from google.genai import errors

from app.core.security import get_current_user
from app.services.rag_service import generate_rag_response
from app.services.chat_db_service import (
    create_conversation,
    save_message,
    get_conversation_messages,
    format_conversation_history,
    get_user_conversation,
    get_user_conversations,
)
from app.services.query_service import rewrite_question

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


class ChatRequest(BaseModel):
    question: str
    top_k: int = 3
    conversation_id: str | None = None


@router.post("/")
def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = str(current_user["_id"])

        if request.conversation_id:

            conversation = get_user_conversation(
                conversation_id=request.conversation_id,
                user_id=user_id,
            )

            if not conversation:

                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found",
                )

            conversation_id = request.conversation_id

        else:

            conversation_id = create_conversation(
                user_id=user_id
            )

        # --------------------------------
        # Get previous messages
        # --------------------------------
        messages = get_conversation_messages(
            conversation_id
        )

        history = format_conversation_history(
            messages
        )

        # --------------------------------
        # Rewrite question
        # --------------------------------
        search_query = rewrite_question(
            question=request.question,
            conversation_history=history,
        )

        # --------------------------------
        # RAG
        # --------------------------------
        result = generate_rag_response(
            question=search_query,
            user_id=user_id,
            top_k=request.top_k,
        )

        # --------------------------------
        # Save user message
        # --------------------------------
        save_message(
            conversation_id=conversation_id,
            role="user",
            content=request.question,
        )

        # --------------------------------
        # Save AI response
        # --------------------------------
        save_message(
            conversation_id=conversation_id,
            role="assistant",
            content=result["answer"],
            sources=result["sources"],
        )

        return {
            "conversation_id": conversation_id,
            "question": request.question,
            "search_query": search_query,
            "answer": result["answer"],
            "sources": result["sources"],
        }

    except HTTPException:
        raise
    except errors.ServerError as e:
        raise HTTPException(
            status_code=503,
            detail=f"The AI model is temporarily experiencing high traffic from Google Gemini. Please try again shortly. ({e.message})",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating response: {str(e)}",
        )

@router.get("/history")
def get_chat_history(
    current_user=Depends(get_current_user),
):

    user_id = str(current_user["_id"])

    conversations = get_user_conversations(
        user_id
    )

    return [
        {
            "id": str(conversation["_id"]),
            "title": conversation["title"],
            "created_at": conversation["created_at"],
            "updated_at": conversation["updated_at"],
        }
        for conversation in conversations
    ]