import fitz

def extract_pages(pdf_path : str) -> list[dict]:
    """
    Extract text from each page of a PDF.

    Returns:
    [
        {
            "page_number" : 1,
            "text: "...
        }
    ]

    """

    pages = []

    document = fitz.open(pdf_path)

    for page_number, page in enumerate(document, start=1) :
        
        text = page.get_text("text").strip()

        if not text:
            continue

        pages.append(
            {
                "page_number" : page_number,
                "text" : text
            }
        )
    
    document.close()

    return pages