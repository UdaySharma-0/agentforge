import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

BAD_PATTERNS = [
    "cookie policy",
    "terms of service",
    "privacy policy",
    "all rights reserved",
]

def clean_text(text: str) -> str:
    return " ".join(text.split())

def is_valid_text(text: str) -> bool:
    cleaned = text.strip()
    if len(cleaned) < 20:
        return False
    
    lower_text = cleaned.lower()
    for pattern in BAD_PATTERNS:
        if pattern in lower_text and len(cleaned) < 100:
            return False
    return True

def scrape_content(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
        tag.decompose()

    main_content = soup.find("article") or soup.find("main") or soup
    text = main_content.get_text(separator=" ")
    
    text = clean_text(text)
    return text if is_valid_text(text) else ""

def get_internal_links(base_url: str, html: str):
    soup = BeautifulSoup(html, "html.parser")
    base_domain = urlparse(base_url).netloc
    links = set()

    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        parsed = urlparse(href)

        if parsed.netloc == base_domain:
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            links.add(clean_url)
    return links

def crawl_website(start_url: str, max_pages: int = 10):
    visited = set()
    to_visit = [start_url]
    collected_text = []

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)

        if url in visited:
            continue

        try:
            res = requests.get(url, headers=HEADERS, timeout=10)
            res.raise_for_status()
            html = res.text
            
            text = scrape_content(html)

            if text:
                collected_text.append({
                    "url": url,
                    "text": text
                })
            
            visited.add(url)

            links = get_internal_links(start_url, html)
            for link in links:
                if link not in visited and link not in to_visit:
                    to_visit.append(link)

        except Exception:
            continue
        print(collected_text)
    return collected_text