from fastapi import APIRouter

from app.services.retrieval_service import search_documents

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

@router.get("/")
def search(
    query : str,
    top_k: int = 5
): 
    results = search_documents(
        query=query,
        top_k=top_k
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