import requests
import docx

# Create dummy resume
doc = docx.Document()
doc.add_paragraph("Test Candidate")
doc.save("test_resume.docx")

url = "http://127.0.0.1:8000/api/v1/applications/"
data = {
    "job": "1",
    "name": "Fallback Test",
    "email": "fallback@example.com",
    "phone": "9999999999",
    "experience_years": "5", 
    "current_ctc": "10",
    "expected_ctc": "15"
}
files = {"resume": open("test_resume.docx", "rb")}

try:
    print("Testing upload...")
    response = requests.post(url, data=data, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 201:
        print("SUCCESS: Upload succeeded despite potential parsing error.")
    else:
        print("FAILURE: Upload still failing.")
except Exception as e:
    print(f"Error: {e}")
