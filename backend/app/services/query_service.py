import logging
import time
from google.genai import errors

from app.services.llm_service import client, FALLBACK_MODELS
from app.core.config import settings

logger = logging.getLogger(__name__)


def rewrite_question(
    question: str,
    conversation_history: str,
) -> str:

    if not conversation_history:
        return question

    prompt = f"""
You are a question rewriting system for a medical
knowledge retrieval application.

Conversation history:

{conversation_history}

Current question:

{question}

Rewrite the current question into a standalone
search query that can be understood without the
conversation history.

Do not answer the question.

Return ONLY the rewritten question.
"""

    models_to_try = [settings.GEMINI_LLM_MODEL]
    for fallback in FALLBACK_MODELS:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response.text and response.text.strip():
                return response.text.strip()
        except errors.ServerError as e:
            logger.warning(
                f"Rewrite model '{model_name}' hit server error ({e.code}): {e.message}. Trying next model..."
            )
            time.sleep(1.0)
        except Exception as e:
            logger.warning(
                f"Rewrite model '{model_name}' failed with {e}. Trying next model..."
            )
            time.sleep(0.5)

    # If rewriting models are temporarily congested, safely fall back to the original question
    return question