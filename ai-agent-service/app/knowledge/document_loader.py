# app/knowledge/document_loader.py

from PyPDF2 import PdfReader
from docx import Document
import os

def load_document(file_path: str) -> str:
    print("document splitting started")
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _load_pdf(file_path)

    if ext == ".docx":
        return _load_docx(file_path)

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    raise ValueError("Unsupported file type")


def _load_pdf(path: str) -> str:
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def _load_docx(path: str) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)
