from app.services.embedding_service import (
    generate_query_embedding,
)

from app.services.vector_service import (
    get_index,
)


def search_documents(
    query: str,
    user_id: str,
    top_k: int = 5,
):

    query_embedding = (
        generate_query_embedding(query)
    )

    index = get_index()

    results = index.query(
    namespace="medical-documents",
    vector=query_embedding,
    top_k=top_k,
    include_metadata=True,
    filter={
        "user_id": {
            "$eq": user_id
        }
    },
)

    return results