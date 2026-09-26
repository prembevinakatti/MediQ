from app.core.config import settings

def create_chunks(pages : list[dict]) -> list[dict]:

    chunks = []

    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP

    chunk_id = 0

    for page in pages:

        text = page["text"]
        page_number = page["page_number"]

        start = 0

        while start < len(text) :

            end = start + chunk_size
            chunk_text = text[start:end].strip()

            if chunk_text:

                chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "text": chunk_text,
                        "page_number": page_number
                    }
                )

                chunk_id += 1

            start = end - overlap

    return chunks
