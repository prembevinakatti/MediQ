from pinecone import Pinecone

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
                "user_id": chunk["user_id"],
                "values": chunk["embedding"],
                "metadata": {
                    "text": chunk["text"],
                    "page_number": chunk["page_number"],
                    "section": chunk.get("section", "General"),
                    "document_name": chunk["document_name"],
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
