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

    prompt = f"""You are MediQ, a precise, evidence-based clinical decision-support assistant.

Answer the user's clinical inquiry using ONLY the provided sources.

STRICT CONCISENESS RULES:
1. ANSWER ONLY WHAT IS ASKED. Never provide unsolicited information.
   - If asked "What is X?": Provide ONLY a 1-2 sentence clinical definition. Do NOT list symptoms, pathophysiology, diagnostics, risk factors, or treatments.
   - If asked "What are the symptoms?": Provide ONLY a concise bulleted list of symptoms found in the sources. Do NOT add an overview paragraph, causes, tests, or clinical notes.
   - If asked about diagnostics or tests: Provide ONLY the diagnostic tests mentioned.
   - If asked about treatment or medications: Provide ONLY the treatments mentioned.
2. DO NOT USE HEADINGS OR SECTION TITLES. Never output markdown headings (such as "### Clinical Summary", "### Pathophysiology", "### Clinical Notes", "### Risk Factors").
3. DO NOT ADD HORIZONTAL LINES (`---`) OR DISCLAIMERS. Never add disclaimer footers like "*Disclaimer: This information is for educational purposes...*" (disclaimers are already built into the application UI).
4. KEEP IT BRIEF: Maximum 2-3 sentences for explanations, or 3-6 concise bullet points for list queries.
5. CITATIONS: Include citation tags like [Source 1] or [Source 2] at the end of factual sentences or bullet points.
6. If the sources do not mention the answer, state in one single sentence: "The provided medical literature does not contain information regarding [topic]."

SOURCE MATERIAL:
----------------------------
{context}
----------------------------

USER CLINICAL INQUIRY:
{question}
----------------------------

Direct concise answer:
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