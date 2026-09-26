from google import genai
from google.genai import types

from app.core.config import settings

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

def generate_document_embedding(
    text: str,
    title: str | None = None,
) -> list[float]:

    if title is None:
        title = "Medical document"


    result = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            title=title,
            output_dimensionality=settings.GEMINI_EMBEDDING_DIMENSION
        )
    )

    return result.embeddings[0].values

def generate_query_embedding(
    query: str,
) -> list[float] :
    result = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=settings.GEMINI_EMBEDDING_DIMENSION,
        ),
    )

    return result.embeddings[0].values