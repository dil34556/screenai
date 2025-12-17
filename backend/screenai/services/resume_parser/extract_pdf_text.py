import pdfplumber
import pytesseract
from PIL import Image

def extract_pdf_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text += page_text + "\n"
            else:
                # OCR fallback for scanned pages
                im = page.to_image(resolution=300).original
                ocr_text = pytesseract.image_to_string(im)
                text += ocr_text + "\n"
    return text
