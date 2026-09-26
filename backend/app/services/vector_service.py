from pinecone import Pinecone

from app.core.config import settings

pc = Pinecone(
    api_key=settings.PINECONE_API_KEY
)

def get_index():
    return pc.Index(
        settings.PINECONE_INDEX_NAME
    )

def store_chunks(chunks: list[dict]):
    index = get_index()

    records = []

    for chunk in chunks:
        records.append(
            {
                "id": str(chunk["chunk_id"]),
                "values": chunk["embedding"],
                "metadata": {
                    "text": chunk["text"],
                    "page_number": chunk["page_number"],
                    "document_name": chunk["document_name"],
                },
            }
        )

    if records:
        index.upsert(
            vectors=records,
            namespace="medical-documents",
        )
