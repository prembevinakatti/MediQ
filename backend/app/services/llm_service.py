from google import genai

from app.core.config import settings

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

def generate_answer(
    question: str,
    context: str,
) -> str:

    prompt = f"""
You are a medical knowledge and education assistant.

Your job is to answer the user's question using ONLY
the information provided in the context below.

IMPORTANT RULES:

1. Do not use information that is not present in the context.
2. Do not invent or hallucinate facts.
3. If the context does not contain enough information,
   clearly say that the provided documents do not contain
   enough information to answer the question.
4. Do not diagnose the user.
5. Do not prescribe medications or provide personalized
   treatment plans.
6. Keep the answer clear and educational.
7. Do not claim to be a doctor.

CONTEXT:
----------------
{context}
----------------

USER QUESTION:
{question}

Answer the question based only on the provided context.
"""

    response = client.models.generate_content(
        model=settings.GEMINI_LLM_MODEL,
        contents=prompt,
    )

    return response.text
