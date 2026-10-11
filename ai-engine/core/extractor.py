"""
Universal Document Extractor
Extracts clean text and structural metadata from PDF, DOCX, TXT, and Source Code files.
"""

import io
import os
from typing import Dict, Tuple, Optional


def extract_text_from_txt(content: bytes) -> str:
    """Decodes plain text with automatic encoding detection fallbacks."""
    for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252", "utf-16"]:
        try:
            return content.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            continue
    return content.decode("utf-8", errors="replace")


def extract_text_from_pdf(content: bytes) -> str:
    """Extracts text page-by-page from PDF documents using pypdf."""
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        text_pages = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            text_pages.append(page_text)
        return "\n\n".join(text_pages)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")


def extract_text_from_docx(content: bytes) -> str:
    """Extracts text from Word .docx documents using stdlib zipfile and XML parser (zero extra dependencies)."""
    try:
        import zipfile
        import xml.etree.ElementTree as ET

        with zipfile.ZipFile(io.BytesIO(content)) as docx_zip:
            if "word/document.xml" in docx_zip.namelist():
                xml_content = docx_zip.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                paragraphs = []
                for p in tree.iterfind(".//w:p", namespaces):
                    texts = [node.text for node in p.iterfind(".//w:t", namespaces) if node.text]
                    if texts:
                        paragraphs.append("".join(texts))
                if paragraphs:
                    return "\n\n".join(paragraphs)
    except Exception:
        pass

    # Optional fallback to python-docx if installed
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document: {str(e)}")


def extract_text_from_file(filename: str, content: bytes) -> Tuple[str, Dict]:
    """
    Universal document extractor routing based on file extension.
    Returns:
    1. Extracted raw text
    2. File metadata (file type, size, character count)
    """
    ext = os.path.splitext(filename)[1].lower()
    file_size = len(content)

    if ext == ".pdf":
        text = extract_text_from_pdf(content)
        file_type = "PDF"
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(content)
        file_type = "DOCX"
    elif ext in [".txt", ".md", ".markdown", ".rtf"]:
        text = extract_text_from_txt(content)
        file_type = "TEXT"
    elif ext in [
        ".py",
        ".java",
        ".cpp",
        ".c",
        ".cs",
        ".js",
        ".ts",
        ".html",
        ".css",
        ".sql",
        ".sh",
    ]:
        text = extract_text_from_txt(content)
        file_type = "CODE"
    else:
        # Default fallback to plain text decode
        text = extract_text_from_txt(content)
        file_type = "UNKNOWN/TEXT"

    metadata = {
        "filename": filename,
        "extension": ext,
        "file_type": file_type,
        "size_bytes": file_size,
        "char_count": len(text),
        "word_count": len(text.split()),
    }

    return text, metadata
