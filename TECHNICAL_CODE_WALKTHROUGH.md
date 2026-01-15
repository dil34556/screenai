# ScreenAI: Technical Code Walkthrough & Study Guide

This document provides a deep dive into the **ScreenAI** codebase, explaining the project structure, how the frontend and backend interact, and the specific logic behind the "One-Click Application" and AI Resume Parsing features.

---

## 1. Project Organization (File Structure)

The project is a **monorepo** containing both the React frontend and Django backend.

```
screenai/
├── backend/                  # Django Project (Server)
│   ├── appscreenai/          # Core App (Auth, Analytics, Employee models)
│   ├── candidates/           # Candidate App (Resume Parsing, Applications logic)
│   ├── jobs/                 # Jobs App (Job Postings, Requirements)
│   ├── screenai/             # Project Settings (settings.py, urls.py)
│   ├── manage.py             # Django entry point
│   ├── verify_serializer.py  # Debugging/Helper scripts
│   └── ...
├── frontend/                 # React Project (Client)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI (Cards, Buttons, Layouts)
│   │   ├── pages/            # Page-level Components (Dashboard, ApplyPage)
│   │   ├── services/         # API Service (api.js - Axios calls)
│   │   ├── App.js            # Main Router Setup
│   │   └── ...
│   ├── package.json          # Dependencies
│   └── ...
└── PROJECT_PRESENTATION.md   # Documentation
```

---

## 2. Backend Architecture (Django)

The backend is built with **Django REST Framework (DRF)**.

### **Core Apps & Responsibilities**

1.  **`appscreenai` (Management)**
    *   **Models**: `Employee` (Recruiter/Admin).
    *   **Views**: `api_views.py` handles the **Dashboard Analytics**. It aggregates data from the `candidates` app to calculate metrics like "Conversion Rate", "Hired This Month", and "Platform Performance".
    *   **Logic**: Uses database filtering (`filter(status='HIRED')`) and date math (`timedelta`) to generate real-time stats.

2.  **`jobs` (Job Board)**
    *   **Models**: `JobPosting` stores the job details, including specific AI requirements like `required_skills` and `screening_questions` (stored as JSONFields).
    *   **Logic**: Provides endpoints for creating/listing jobs.

3.  **`candidates` (The "AI Engine")**
    *   **Models**: 
        *   `Candidate`: Base profile (Name, Email).
        *   `Application`: The core record linking a Candidate to a Job. Contains parsed fields like `skills`, `education`, `resume_text`.
    *   **Views (`backend/candidates/views.py`)**:
        *   `ApplicationListCreateView`: Handles form submission.
        *   `PreviewResumeView`: The **"Magic" endpoint** that autofills the frontend form.

---

## 3. Frontend Architecture (React)

The frontend is a Single Page Application (SPA).

### **Key Pages**

1.  **`DashboardPage.js`**
    *   Visualizes the hiring health. It fetches data from `/api/v1/analytics/dashboard/` and renders it using Recharts (Graphs) and KPI cards.

2.  **`ApplyPage.js` (The Candidate Experience)**
    *   This is the most complex page. It handles:
        *   **File Upload**: User selects a PDF.
        *   **Two-Stage Parsing**:
            1.  **Quick Scan**: Regex-based extraction (instant) for Name/Email.
            2.  **Deep Scan**: AI-based extraction (takes ~5s) for Skills/Experience.
        *   **Dynamic Form**: Renders custom screening questions defined in the Job model.

---

## 4. The "Magic" Workflow: AI Resume Parsing

This is the core feature of ScreenAI. Here is the step-by-step code flow of what happens when a user uploads a resume.

### **Phase 1: The Upload (Frontend)**
*   **File**: `frontend/src/pages/ApplyPage.js`
*   **Action**: User selects a file. `handleResumeAutoFill(file)` is triggered.
*   **Code**:
    ```javascript
    // ApplyPage.js
    const handleResumeAutoFill = async (file) => {
        setIsAnalyzing(true);
        const data = new FormData();
        data.append('resume', file);
        
        // Call Backend API
        const result = await previewResume(data); 
        
        // Update State with AI Data
        setFormData(prev => ({
            ...prev,
            skills: result.data.skills,
            experience_years: result.data.total_years_experience
        }));
    };
    ```

### **Phase 2: The API Endpoint (Backend)**
*   **File**: `backend/candidates/views.py` -> `PreviewResumeView`
*   **Action**: Receives the file, saves it momentarily to a temp folder, and calls the parser service.
*   **Code**:
    ```python
    # candidates/views.py
    class PreviewResumeView(views.APIView):
        def post(self, request):
            resume_file = request.FILES.get("resume")
            # ... save to temp ...
            
            # CALL THE AI SERVICE
            from screenai.services.resume_parser.parser import parse_resume
            parsed_data = parse_resume(full_path)
            
            return Response(parsed_data)
    ```

### **Phase 3: The Intelligence (Gemini Service)**
*   **File**: `backend/screenai/services/resume_parser/parser.py` (Hypothetical location based on imports)
*   **Logic**:
    1.  **Extract Text**: Converts PDF/DOCX to raw text.
    2.  **Prompt Engineering**: specific prompt sent to Google Gemini: *"Extract skills, experience, and education from this text in JSON format."*
    3.  **JSON Cleaning**: Cleans the AI response (strips markdown) and returns a Python dictionary.

---

## 5. Deployment & Configuration

*   **API Communication**: The frontend uses `axios` (in `api.js`) to talk to `http://localhost:8000/api/v1/`.
*   **CORS**: Django is configured to accept requests from `localhost:3000` (React).
*   **Database**: Uses `db.sqlite3` for easy development only `python manage.py migrate` is needed to sync changes.

---

## 6. How to Run & Verify

To "study" the project in action:

1.  **Run Backend**:
    ```bash
    cd backend
    python manage.py runserver
    ```
2.  **Run Frontend**:
    ```bash
    cd frontend
    npm start
    ```
3.  **Test the Flow**:
    *   Open `http://localhost:3000`.
    *   Go to "Create Job" -> Make a job.
    *   Open the "Public Link" (or Apply button).
    *   **Upload a Resume** -> Watch the fields fill automatically.
    *   **Submit**.
    *   Go back to **Dashboard** -> Verify the "New Application" count increased.
