# ScreenAI: Intelligent Recruitment Platform
## Project Overview & Technical Walkthrough

**ScreenAI** is an advanced, AI-powered recruitment automation platform designed to streamline the hiring process. It bridges the gap between recruiters and candidates by automating resume screening, managing job postings, and providing real-time analytics on the hiring pipeline.

---

## 1. Executive Summary

- **Product Name**: ScreenAI
- **Core Value**: Reduces time-to-hire by automating initial candidate screening and data extraction using Generative AI (Gemini).
- **Primary Users**: 
    - **Recruiters/HR**: To post jobs, track applicants, and view analytics.
    - **Candidates**: To apply for jobs with a seamless experience.

---

## 2. Architecture

ScreenAI follows a modern **Client-Server Architecture**:

### **Frontend (Client)**
- **Framework**: React.js
- **Styling**: TailwindCSS & Custom "Gemini Canvas" Design System (Glassmorphism, Dark/Light modes).
- **Key Pages**:
    - **Dashboard**: Real-time metrics (Graphs, KPI Cards).
    - **Job Board**: Create and Manage Job Postings.
    - **Candidate Pipeline**: Kanban/List view of applicants.
    - **Apply Page**: Public-facing form for candidates.

### **Backend (Server)**
- **Framework**: Django & Django REST Framework (DRF).
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **AI Integration**: Google Gemini Pro (via API) for Resume Parsing and Smart Matching.

### **Data Flow**
1. **Candidate** uploads Resume (PDF/DOCX) on Frontend.
2. **Frontend** sends file to Backend API.
3. **Backend** processes file -> Sends text to **Gemini AI**.
4. **AI** extracts structured data (Skills, Experience, Education).
5. **Backend** saves structured `Application` record in Database.
6. **Recruiter** sees updated data on Dashboard instantly.

---

## 3. Key Modules & Features

### A. Authentication & User Management
- Secure Login/Logout for Recruiters.
- Role-based access (Admin vs Recruiter).
- **Files**: `backend/appscreenai/models.py` (Employee Model), `frontend/src/pages/LoginPage.js`.

### B. Job Management
- Create detailed job descriptions with specific criteria:
    - **Quantitative**: CTC Range, Experience Years (Sliders).
    - **Qualitative**: Required Skills, Previous Companies.
- **Files**: `backend/jobs/models.py` (JobPosting), `frontend/src/pages/CreateJobPage.js`.

### C. Intelligent Resume Parsing
- Automatically extracts candidate details from uploaded resumes.
- **Extracted Fields**:
    - Total Years of Experience.
    - Key Skills (matched against Job Requirements).
    - Education History.
    - Contact Info (Email, Phone - used for Autofill).
- **Files**: `backend/candidates/models.py`, `backend/verify_serializer.py`.

### D. Analytics Dashboard
- Visualizes the health of the hiring pipeline.
- **Metrics**:
    - Weekly Application Trends.
    - Hiring Pipeline Distribution (New -> Screened -> Interview -> Hired).
    - Source Performance (LinkedIn vs Website).
- **Files**: `backend/appscreenai/api_views.py` (Analytics endpoints), `frontend/src/pages/DashboardPage.js`.

---

## 4. Operational Workflow (The "Working of the Project")

### Step 1: Posting a Job
1. Recruiter logs in.
2. Navigates to **"Create Job"**.
3. Fills in details: "Senior React Developer", "12-20 LPA", "Required Skills: React, Redux".
4. System publishes the job to the **active** list.

### Step 2: Candidate Application
1. Candidate receives a link or visits the career page.
2. Selects the job.
3. **Uploads Resume**.
4. **Result**: The form *Autofills* their name, email, and experience (AI Magic).
5. Candidate submits the application.

### Step 3: Screening & Management
1. Recruiter checks the **Dashboard** -> Sees "New Application" count increase.
2. Navigates to **"Job Candidates"**.
3. Reviews the candidate's AI-parsed profile compared to job requirements.
4. Moves candidate to **"Interview"** stage or **"Reject"**.

### Step 4: Analyics & Improvement
1. Admin reviews **HR Team Performance** on the Dashboard.
2. Checks **Conversion Rates** to optimize job descriptions.

---

## 5. Technical Stack Summary

| Component | Technology | Use Case |
|-----------|------------|----------|
| **Frontend** | React, React Router | User Interface & SPA Routing |
| **Styling** | CSS Modules, Tailwind | "Gemini Canvas" Aesthetic |
| **Backend** | Django, Python | Business Logic, API, Database ORM |
| **API** | Django REST Framework | Communication between Front/Back |
| **AI** | Google Gemini | Resume Text Analysis & Extraction |
| **DB** | SQLite | Data Persistence |

---

## 6. Conclusion
ScreenAI is not just a form-collection tool; it is an intelligent system that actively reduces the manual workload of recruiters by structuring unstructured resume data. It provides clarity and speed to the hiring process through modern design and powerful backend logic.
