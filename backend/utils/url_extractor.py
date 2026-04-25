import re

def extract_urls_from_text(text: str) -> list[str]:
    """
    Extracts all URLs from the given raw text.
    """
    if not text:
        return []
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
    return list(dict.fromkeys(urls))  # deduplicate
