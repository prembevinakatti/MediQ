from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings


def create_pinecone_index():
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)

    existing_indexes = [index.name for index in pc.list_indexes()]

    if settings.PINECONE_INDEX_NAME in existing_indexes:
        print("Pinecone index already exists.")
        return

    pc.create_index(
        name=settings.PINECONE_INDEX_NAME,
        dimension=settings.GEMINI_EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

    print("Pinecone index created.")