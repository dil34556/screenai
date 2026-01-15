import json

# Simulate the structure saved by views.py
# views.py saves: application.resume_text = json.dumps(parsed_data, indent=2)
# parsed_data = parsed.dict() where parsed is FinalOutput(data=ResumeData(...))

mock_resume_text = json.dumps({
    "data": {
        "candidate_name": "John Doe",
        "work_experience": [
            {"company_name": "Google", "job_role": "Engineer"},
            {"company_name": "Microsoft", "job_role": "Manager"}
        ],
        "skills": ["Python", "Django"]
    }
})

def get_work_experience(resume_text):
    if not resume_text:
        return []
    try:
        data = json.loads(resume_text)
        
        resume_data = data.get('data', {})
        if not resume_data and 'work_experience' in data:
             resume_data = data
        
        return resume_data.get('work_experience', [])
    except:
        return []

print("Extracted:", get_work_experience(mock_resume_text))
