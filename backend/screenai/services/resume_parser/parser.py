from math import lcm
import pdfplumber
import docx
import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import json

load_dotenv()

# ------------ SCHEMA ------------
class WorkExperience(BaseModel):
    company_name: Optional[str] = None
    job_role: Optional[str] = None

class ResumeData(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    total_years_experience: Optional[float] = None
    skills: List[str] = []
    education: List[str] = []
    certifications: List[str] = []
    work_experience: List[WorkExperience] = []

class FinalOutput(BaseModel):
    data: ResumeData

parser = PydanticOutputParser(pydantic_object=FinalOutput)

# ------------ PDF TEXT EXTRACTION ------------
def extract_pdf_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text

# ------------ DOCX TEXT EXTRACTION ------------
def extract_docx_text(docx_path):
    doc = docx.Document(docx_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return '\n'.join(text)

# ------------ API KEYS MANAGMENT ------------
def get_available_api_keys():
    """Returns a list of available API keys from environment variables."""
    keys = []
    
    # Check primary keys
    primary = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if primary:
        keys.append(primary)
        
    # Check for numbered keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.)
    # We'll check a reasonable range, e.g., up to 10
    for i in range(2, 11):
        key = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GOOGLE_API_KEY_{i}")
        if key:
            keys.append(key)
            
    if not keys:
        # Fallback to empty string to let get_llm raise the specific error if needed, 
        # or just return empty list and handle in caller.
        return []
        
    return keys

# ------------ LLM SETUP ------------
def get_llm(model_name="gemini-2.5-flash", api_key=None):
    if not api_key:
        raise RuntimeError("No API Key provided")

    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=0,
        google_api_key=api_key
    )

# ------------ PROMPT ------------
parse_prompt = PromptTemplate(
    template="""
Extract the following fields from the resume and return JSON in EXACT FORMAT:

- Name
- Email
- Phone number
- Total years of work experience (Numeric float value, e.g. 2.5)
- Companies worked for, and job roles at those companies
- Skills

{format_instructions}

Resume Text:
{resume_text}
""",
    input_variables=["resume_text"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# ------------ PARSER FUNCTION ------------
def parse_resume(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.pdf':
        text = extract_pdf_text(file_path)
    elif ext in ['.docx', '.doc']:
        if ext == '.doc':
             raise ValueError("Legacy .doc format not supported. Please convert to .docx or .pdf")
        text = extract_docx_text(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    prompt = parse_prompt.format(resume_text=text)
    print(f"DEBUG: Extracted text length: {len(text)} chars")

    models_to_try = [
        "gemini-2.0-flash-lite-preview-02-05", # Try Lite first (cheaper/likely available)
        "gemini-2.0-flash-exp",                 # Experimental often free/separate quota
        "gemini-exp-1206",                      
        "gemini-flash-latest",
        "gemini-2.5-flash"
    ]
    
    # 2. Get Keys
    api_keys = get_available_api_keys()
    if not api_keys:
        raise RuntimeError("No 'GOOGLE_API_KEY' or 'GEMINI_API_KEY' found in environment.")
    
    last_exception = None
    import time
    
    for model in models_to_try:
        # For each model, try ALL available keys
        for key_idx, api_key in enumerate(api_keys):
            try:
                # Mask key for logging
                masked_key = f"...{api_key[-4:]}" if len(api_key) > 4 else "INVALID"
                print(f"Trying model: {model} with Key #{key_idx + 1} ({masked_key})")
                
                llm = get_llm(model_name=model, api_key=api_key)
                response = llm.invoke(prompt)
                parsed = parser.parse(response.content)
                return parsed.dict()
                
            except Exception as e:
                msg = f"Model {model} with Key #{key_idx + 1} failed: {e}"
                print(msg)
                
                last_exception = e
                # Don't sleep if it's a key error, just switch fast. 
                # time.sleep(0.5) 
                continue
            
    # If all models AND all keys fail
    raise last_exception or Exception("All models and API keys failed to parse resume.")



if __name__ == "__main__":
    # Test block
    print("Resume Parser Module Loaded")
