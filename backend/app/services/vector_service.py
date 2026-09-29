from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings

pc = Pinecone(
    api_key=settings.PINECONE_API_KEY
)

def clear_documents():

    index = get_index()

    index.delete(
        namespace="medical-documents",
        delete_all=True,
    )

    return {
        "message": "Medical document namespace cleared."
    }

def get_index():
    if not pc.has_index(settings.PINECONE_INDEX_NAME):
        pc.create_index(
            name=settings.PINECONE_INDEX_NAME,
            dimension=settings.GEMINI_EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1",
            ),
        )
    return pc.Index(
        settings.PINECONE_INDEX_NAME
    )

def store_chunks(chunks: list[dict]):
    index = get_index()

    records = []

    for chunk in chunks:
        records.append(
            {
                "id": f"{chunk['document_name']}_{chunk['chunk_id']}",
                "values": chunk["embedding"],
                "metadata": {
                    "user_id": chunk["user_id"],
                    "text": chunk["text"],
                    "page_number": chunk["page_number"],
                    "section": chunk.get("section", "General"),
                    "document_name": chunk["document_name"],
                    "document_id": chunk["document_id"],
                },
            }
        )

    if records:
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            index.upsert(
                vectors=batch,
                namespace="medical-documents",
            )
