import os
import shutil
from pathlib import Path
from pypdf import PdfReader
from docx import Document
from config import get_settings

settings = get_settings()


def ensure_upload_dir():
    """Create upload directory if it doesn't exist"""
    Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)


def save_uploaded_file(file_content: bytes, filename: str) -> str:
    """Save uploaded file and return path"""
    ensure_upload_dir()
    
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return file_path


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        text = ""
        with open(file_path, "rb") as pdf_file:
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""


def extract_resume_text(file_path: str) -> str:
    """Extract text from resume (PDF or DOCX)"""
    if file_path.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Use PDF or DOCX")


def delete_file(file_path: str):
    """Delete uploaded file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
