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
- total_years_experience (Numeric float value, e.g. 2.5)
- work_experience (List of companies and roles. STRICTLY EXCLUDE Academic Projects, Thesis, University Studies, and Predictions. Only include professional employment.)
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
        "gemini-1.5-flash",        # <--- FASTEST & STABLE. Prioritize this.
        "gemini-2.0-flash-exp",    # New fast model
        "gemini-1.5-pro",          # Good fallback
        "gemini-pro"               # Legacy
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
                
                # --- POST PROCESSING FILTER ---
                # Strictly remove academic projects that LLM might have let through
                # Remove "system", "app" to allow real jobs
                # Add Education terms
                project_keywords = ["project", "study", "prediction", "thesis", "clone", "detection", "semester", "mca", "btech", "degree", "bachelor", "master", "student"]
                filtered_exp = []
                for exp in parsed.data.work_experience:
                    c = (exp.company_name or "").lower()
                    r = (exp.job_role or "").lower()
                    
                    is_bad = False
                    for pk in project_keywords:
                        # Check specific whole words or very strong signals
                        if f" {pk} " in f" {c} " or f" {pk} " in f" {r} ":
                             is_bad = True
                             break
                    
                    if not is_bad:
                        filtered_exp.append(exp)
                        
                parsed.data.work_experience = filtered_exp
                # -------------------------------
                
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
    found_experience = []
    # Match dates like 2020 - 2022, Jan 2019 - Present, 01/2020 - 02/2021
    date_pattern = r'\b(?:19|20)\d{2}\b.*?(?:-|–|to).*?(?:\b(?:19|20)\d{2}\b|present|current|now)'
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for i, line in enumerate(lines):
        if re.search(date_pattern, line.lower()):
            # CASE A: "Software Engineer | Google | 2020-2022" (All in one line)
            # CASE B: "2020 - 2022" (Date on own line, Company above)
            
            company = ""
            role = ""
            
            # If line is mostly just the date (short length)
            if len(line.split()) < 7:
                # Look at previous 1-2 lines for company/role
                if i > 0:
                   prev = lines[i-1]
                   if len(prev.split()) < 10: # Avoid capturing paragraphs
                       company = prev
                   if i > 1:
                       prev2 = lines[i-2]
                       if len(prev2.split()) < 10 and not role:
                           # e.g. Line 1: Google, Line 2: Engineer, Line 3: Date
                           role = prev2
                           # Swap if needed based on keywords? (Not easy without NLP)
            else:
                # Line matches date but is long. Assume it contains info.
                # "Senior Dev at Google 2020-2022"
                company = line # Fallback: use whole line 
                
            # Check for "Project" keywords to exclude
            is_project = False
            # Remove "system", "app", "analysis" as they trigger on "Systems Engineer", "Application Dev", "Data Analyst"
            # Add Education keywords to exclude degrees appearing as jobs
            project_keywords = ["project", "study", "prediction", "thesis", "clone", "detection", "semester", "mca", "btech", "degree", "bachelor", "master", "student"]
            
            # Helper to check keywords (Use word boundaries)
            def has_keyword(text):
                # Check for whole words only
                for pk in project_keywords:
                    if re.search(r'\b' + re.escape(pk) + r'\b', text.lower()):
                        return True
                return False

            if has_keyword(company) or has_keyword(role):
                is_project = True

            if (company or role) and not is_project:
                found_experience.append({
                    "company_name": company if company else (role if not company else "Unknown"),
                    # If role is missing, don't use "Extracted Role" placeholder, use empty or generic
                    "job_role": role if role else "",
                    "duration": line # Capture the date line as duration
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


def scan_resume_regex(text):
    """
    Perform a quick regex-based scan for contact info and basic details.
    Used for instant autofill before deep LLM parsing.
    """
    import re

    # 1. Email Regex
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    found_email = None
    email_match = re.search(email_pattern, text)
    if email_match:
        found_email = email_match.group(0)

    # 2. Phone Regex
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    found_phone = None
    # Better simple fallback
    simple_phone = re.search(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', text)
    if simple_phone:
        found_phone = simple_phone.group(0).strip()

    # 3. Name Heuristic
    candidate_name = ""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        for i in range(min(3, len(lines))):
            potential_name = lines[i]
            if "resume" not in potential_name.lower() and "curriculum" not in potential_name.lower() and len(potential_name.split()) < 5:
                if len(potential_name.split()) >= 2 and any(c.isalpha() for c in potential_name):
                     candidate_name = potential_name
                     break

    return {
        "candidate_name": candidate_name,
        "email": found_email,
        "phone": found_phone
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
