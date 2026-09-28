import re

from app.core.config import settings


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text.
    """

    # Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def is_heading(line: str) -> bool:
    """
    Simple heading detection.

    This is intentionally lightweight for our first version.
    """

    line = line.strip()

    if not line:
        return False

    # Very long lines are unlikely to be headings
    if len(line) > 100:
        return False

    # Headings usually don't end with punctuation
    if line.endswith((".", ",", ";", ":")):
        return False

    # Ignore very short fragments
    if len(line) < 3:
        return False

    words = line.split()

    # Short lines are often headings
    if len(words) <= 8:
        return True

    return False


def create_chunks(pages: list[dict]) -> list[dict]:

    chunks = []

    chunk_id = 0

    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP

    for page in pages:

        page_number = page["page_number"]

        text = clean_text(page["text"])

        lines = text.split("\n")

        current_section = "General"

        current_text = ""

        for line in lines:

            line = line.strip()

            if not line:
                continue

            # --------------------------------
            # Detect section heading
            # --------------------------------

            if is_heading(line):

                current_section = line

                continue

            # --------------------------------
            # Add content
            # --------------------------------

            if current_text:

                current_text += " " + line

            else:

                current_text = line

            # --------------------------------
            # Create chunk when large enough
            # --------------------------------

            if len(current_text) >= chunk_size:

                chunk_text = current_text.strip()

                chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "text": chunk_text,
                        "page_number": page_number,
                        "section": current_section,
                    }
                )

                chunk_id += 1

                # Keep overlap
                current_text = (
                    current_text[-overlap:]
                )

        # --------------------------------
        # Store remaining text
        # --------------------------------

        if current_text.strip():

            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "text": current_text.strip(),
                    "page_number": page_number,
                    "section": current_section,
                }
            )

            chunk_id += 1

    return chunks