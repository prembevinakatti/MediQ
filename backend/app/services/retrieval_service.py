from app.services.embedding_service import generate_query_embedding
from app.services.vector_service import get_index

def search_documents(
    query: str,
    top_k: int = 5,
):
    """
    Convert the user's question into an embedding
    and search Pinecone for the most relevant chunks.
    """

    query_embedding = generate_query_embedding(query)

    index = get_index()

    results = index.query(
        namespace="medical-documents",
        top_k=top_k,
        vector=query_embedding,
        include_metadata=True,
    )

    return results