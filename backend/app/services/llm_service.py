import logging
import time
from google import genai
from google.genai import errors

from app.core.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

FALLBACK_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
]


def generate_answer(
    question: str,
    context: str,
) -> str:

    prompt = f"""
You are a medical knowledge and education assistant.

Answer the user's question using ONLY the provided sources.

IMPORTANT RULES:

1. Use only information contained in the provided sources.
2. Do not invent or hallucinate information.
3. Every factual claim should be supported by a source.
4. Cite sources using [Source 1], [Source 2], etc.
5. Only cite a source when it actually supports the claim.
6. Do not create source numbers that are not provided.
7. If the provided sources do not contain enough information,
   clearly say that the documents do not contain enough information.
8. Do not diagnose the user.
9. Do not prescribe medication.
10. Do not provide personalized treatment plans.
11. Keep the answer educational and clear.
12. Do not claim to be a doctor.

SOURCE MATERIAL:
----------------------------

{context}

----------------------------

USER QUESTION:

{question}

----------------------------

Answer the question using the source material.

Include citations such as [Source 1] or [Source 2]
after the relevant statements.
"""

    models_to_try = [settings.GEMINI_LLM_MODEL]
    for fallback in FALLBACK_MODELS:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return response.text
        except errors.ServerError as e:
            logger.warning(
                f"Model '{model_name}' encountered a server error ({e.code}): {e.message}. Trying next available model..."
            )
            last_error = e
            time.sleep(1.5)
        except Exception as e:
            logger.warning(
                f"Model '{model_name}' failed with {type(e).__name__}: {e}. Trying next available model..."
            )
            last_error = e
            time.sleep(1.0)

    if last_error:
        raise last_error

    return "No response could be generated."