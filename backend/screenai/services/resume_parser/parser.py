from math import lcm
import pdfplumber
import docx
import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import json

load_dotenv()

# ------------ CONSTANTS ------------
SKILL_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust",
    # Web
    "react", "angular", "vue", "html", "css", "django", "flask", "fastapi", "spring", "node.js", "express",
    # Data/AI
    "sql", "postgresql", "mysql", "mongodb", "redis", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "openai", "llm", "rag",
    # Tools/Cloud
    "git", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "jenkins", "jira", "agile", "scrum",
    # Microsoft
    "excel", "microsoft excel", "powerbi", "power bi", "word", "powerpoint",
    # Mobile/Other
    "flutter", "dart", "react native", "ios", "android", "swift", "kotlin", "unity",
    # New additions based on feedback
    "machine learning", "ml", "deep learning", "nlp", "computer vision", "statistics", "mathematics"
]

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

- candidate_name (Extract the full name of the candidate)
- email
- phone
- total_years_experience (Numeric float value, e.g. 2.5)
- work_experience (List of companies and roles)
- skills (List of strings)
- education (List of strings)
- certifications (List of strings)

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
                
                # Force set env var for Langchain/GenerativeAI robustness
                os.environ["GOOGLE_API_KEY"] = api_key
                os.environ["GEMINI_API_KEY"] = api_key
                
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
            
            
    # If all models AND all keys fail, use Regex Fallback
    print("WARNING: All LLM models failed. Attempting Regex fallback...")
    
    import re
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    # Simple logic: take first match
    found_email = emails[0] if emails else None
    
    # Phone regex needs cleaning as it captures groups
    found_phone = None
    if phones:
        # Re-construct string from groups or just use a simpler findall approach if needed
        # But let's try a simpler phone regex for fallback
        simple_phone = re.search(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', text)
        if simple_phone:
            found_phone = simple_phone.group(0).strip()
            
    print(f"DEBUG: Regex Fallback found: Email={found_email}, Phone={found_phone}")
    
    # Heuristic for Name: First non-empty line that isn't a common header
    candidate_name = ""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # Check first 3 lines for a likely name (not "Resume", "CV", etc)
        for i in range(min(3, len(lines))):
            potential_name = lines[i]
            if "resume" not in potential_name.lower() and "curriculum" not in potential_name.lower() and len(potential_name.split()) < 5:
                # Basic check: at least 2 words, mostly letters
                if len(potential_name.split()) >= 2 and any(c.isalpha() for c in potential_name):
                     candidate_name = potential_name
                     break

    # Return structure MUST match what Pydantic returns (nested under 'data' if using .dict())
    # Wait, Pydantic parser.parse(content) returns a FinalOutput object.
    # .dict() on that object returns {'data': {...}}
    
    # Heuristic for Skills
    found_skills = []
    text_lower = text.lower()
    
    # 1. Keyword Scan
    for skill in SKILL_KEYWORDS:
        # Simple whole word match ideally, but simple substring for now is okay for fallback
        # Better: use regex for word boundary
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.title())  # Capitalize for display

    # 2. Section Scraper (Greedy Search)
    # Look for "SKILLS" header and grab lines until next empty line or header
    skill_section_pattern = r'\n\s*(?:skills|technical skills|technologies)\s*\n'
    section_match = re.search(skill_section_pattern, text_lower)
    if section_match:
        start_idx = section_match.end()
        # Grab chunk of text after header
        remainder = text[start_idx:]
        lines = remainder.split('\n')
        
        for line in lines[:10]: # Check next 10 lines max
            line = line.strip()
            if not line: continue
            
            # Stop if we hit another header (all caps usually or specific words)
            if re.match(r'^[A-Z\s]{4,}$', line) or "experience" in line.lower() or "education" in line.lower():
                break
                
            # Assume comma separated or bullet points
            # Split by comma
            parts = [p.strip() for p in re.split(r'[,|]', line)]
            for p in parts:
                p_clean = p.strip('•-–* ')
                if 2 < len(p_clean) < 30: # Reasonable skill length
                     # Add if not already found (and not super generic words)
                     if p_clean.title() not in found_skills:
                         found_skills.append(p_clean.title())

    # Heuristic for Work Experience
    # Look for lines with dates (e.g., 2020 - 2022, Jan 2019 - Present)
    found_experience = []
    # Match: (Year) ... ( - / to ) ... (Year / Present)
    # \b(19|20)\d{2}\b : Starts with year 19xx or 20xx
    # .*? : chars in between
    # [-–]|to : separator
    # .*? : chars in between
    # \b((19|20)\d{2}|present|current|now)\b : Ends with year or present keyword
    date_pattern = r'\b(?:19|20)\d{2}\b.*?(?:-|–|to).*?(?:\b(?:19|20)\d{2}\b|present|current|now)'
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for i, line in enumerate(lines):
        if re.search(date_pattern, line.lower()):
            # If line has date, it might be "Role at Company | 2020-2022"
            # Or the line BEFORE it might be the company
            
            # Simple heuristic: Take the whole line as the 'role' or 'company'
            # Let's try to split by some separator if possible, or just dump the line in company_name
            
            # Clean up the line a bit
            clean_line = line
            
            # If line is short and has date, maybe previous line is company?
            if len(line.split()) < 5 and i > 0:
                 clean_line = f"{lines[i-1]} ({line})"
            
            found_experience.append({
                "company_name": clean_line,
                "job_role": "Extracted from Resume" 
            })

    return {
        "data": {
            "candidate_name": candidate_name,
            "email": found_email,
            "phone": found_phone,
            "total_years_experience": 0,
            "skills": found_skills,
            "education": [],
            "certifications": [],
            "work_experience": found_experience
        }
    }



if __name__ == "__main__":
    # Test block
    print("Resume Parser Module Loaded")
    try:
        keys = get_available_api_keys()
        print(f"DEBUG: Found {len(keys)} API keys")
        if len(keys) > 0:
            print(f"DEBUG: First key starts with: {keys[0][:4]}...")
    except Exception as e:
        print(f"DEBUG: Error getting keys: {e}")
