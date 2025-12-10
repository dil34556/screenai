import random
import json

class AIScreener:
    def __init__(self):
        print("AI Service: Running in MOCK MODE (No external API calls)")

    def extract_text_from_pdf(self, pdf_path):
        """Extracts text from a PDF file."""
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

    def analyze_application(self, resume_text, job_description):
        """
        MOCK ANALYSIS: Generates a deterministic score based on keyword overlapping.
        This allows testing the app flow without an active API Key.
        """
        
        # Simple extraction of keywords from JD (fake logic)
        jd_words = set(job_description.lower().split())
        resume_words = set(resume_text.lower().split())
        
        # Check for some common tech keywords to make it look "smart"
        tech_keywords = {"python", "django", "react", "javascript", "aws", "docker", "sql", "git", "api", "rest"}
        
        found_skills = [mw for mw in tech_keywords if mw in resume_words]
        missing_skills = [mw for mw in tech_keywords if mw not in resume_words and mw in jd_words]
        
        # Calculate a fake "Score"
        base_score = 60
        score_boost = len(found_skills) * 5
        final_score = min(95, base_score + score_boost)
        
        summary = f"Candidate shows proficiency in {', '.join(found_skills[:3])}. "
        if final_score > 80:
            summary += "Strong match for the role based on key technical skills."
        else:
            summary += "Resume indicates junior experience or missing key specific requirements."

        return {
            "match_score": final_score,
            "summary": summary,
            "missing_skills": missing_skills if missing_skills else ["Specific Domain Knowledge"],
            "red_flags": "None detected in mock analysis."
        }
