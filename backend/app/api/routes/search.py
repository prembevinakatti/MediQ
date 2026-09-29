from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.retrieval_service import search_documents

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

@router.get("/")
def search(
    query: str,
    top_k: int = 5,
    current_user=Depends(get_current_user),
): 
    user_id = str(current_user["_id"])
    results = search_documents(
        query=query,
        user_id=user_id,
        top_k=top_k,
    )

    matches = []

    for match in results.matches:

        matches.append(
            {
                "score": match.score,
                "text":match.metadata.get("text"),
                "page_number" : match.metadata.get(
                    "page_number"
                ),
                "document_name": match.metadata.get(
                    "document_name"
                )
            }
        )

    return {
        "query" : query,
        "results" : matches
    }