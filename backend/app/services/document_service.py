from pathlib import Path

from app.services.pdf_service import extract_pages
from app.services.chunk_service import create_chunks
from app.services.embedding_service import (generate_document_embedding)
from app.services.vector_service import store_chunks


def process_document(pdf_path: str) :

    pages = extract_pages(pdf_path)

    chunks = create_chunks(pages)

    document_name = Path(pdf_path).name

    for chunk in chunks:

        chunk["embedding"] = generate_document_embedding(
            text=chunk["text"],
            title=document_name
        )

        chunk["document_name"] = document_name


    store_chunks(chunks)

    return {
        "document_name": document_name,
        "pages": len(pages),
        "chunks": len(chunks)
    }