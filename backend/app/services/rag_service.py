from app.services.retrieval_service import (
    search_documents,
)

from app.services.llm_service import (
    generate_answer,
)


def generate_rag_response(
    question: str,
    user_id: str,
    top_k: int = 3,
):

    # --------------------------------
    # 1. Retrieve
    # --------------------------------

    results = search_documents(
        query=question,
        user_id=user_id,
        top_k=top_k,
    )

    context_parts = []

    sources = []

    for index, match in enumerate(
        results.matches,
        start=1,
    ):

        text = match.metadata.get(
            "text",
            "",
        )

        page_number = match.metadata.get(
            "page_number"
        )

        document_name = match.metadata.get(
            "document_name"
        )

        section = match.metadata.get(
            "section",
            "General",
        )

        # -----------------------------
        # Context
        # -----------------------------

        context_parts.append(
            f"""
[Source {index}]

Document: {document_name}
Page: {page_number}
Section: {section}

Content:
{text}
"""
        )

        # -----------------------------
        # Source metadata
        # -----------------------------

        sources.append(
            {
                "id": index,
                "document": document_name,
                "page": page_number,
                "section": section,
                "score": round(
                    match.score,
                    4,
                ),
            }
        )

    context = "\n\n".join(
        context_parts
    )

    # --------------------------------
    # 2. Generate answer
    # --------------------------------

    answer = generate_answer(
        question=question,
        context=context,
    )

    return {
        "answer": answer,
        "sources": sources,
    }