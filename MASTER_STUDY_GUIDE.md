# ScreenAI: Master Codebase Study Guide
**Version 1.0**

This document acts as a "Textbook" for the ScreenAI project. It is designed for developers who need to understand *every* part of the system, from the database schema to the AI logic.

---

## 📚 Module 1: System Overview

ScreenAI is a **Recruitment Automation Platform**.
*   **Frontend**: React.js (Client-side rendering, Component-based).
*   **Backend**: Django (API Server, Business Logic, Database).
*   **AI Engine**: Google Gemini (Resume parsing).
*   **Database**: SQLite (Local development default).

---

## 📚 Module 2: The Backend (Django)

The backend is organized into "Apps". Each app handles a specific domain.

### 2.1 Core App (`appscreenai`)
*   **Purpose**: Manages Users (Recruiters) and Global Analytics.
*   **Key File**: `models.py`
    *   `Employee`: Extends the user model. Stores `is_admin`, `email`.
*   **Key File**: `api_views.py`
    *   **Function**: `analytics_overview`
    *   **Logic**: Performs complex aggregations (Count, Filter) on the `Application` table to generate dashboard numbers (e.g., Conversion Rate).

### 2.2 Jobs App (`jobs`)
*   **Purpose**: Manages Job Postings.
*   **Key File**: `models.py`
    *   `JobPosting`: The central model.
    *   **Feature**: `screening_questions` (JSONField). Allows dynamic, custom questions per job.
    *   **Feature**: `required_skills` (JSONField). Used by the AI to match candidates.

### 2.3 Candidates App (`candidates`)
*   **Purpose**: Manages Applicants and Resumes.
*   **Key File**: `models.py`
    *   `Application`: Links a `Candidate` to a `Job`.
    *   **Fields**: `resume_text` (Raw text extracted), `skills` (AI extracted), `status` (Kanban stage).
*   **Key File**: `views.py`
    *   **Class**: `PreviewResumeView`
    *   **Role**: Accepts a file upload -> Calls AI Parser -> Returns JSON to Frontend. **This is the "Autofill" endpoint.**

---

## 📚 Module 3: The AI Engine (The "Brain")

This is the most critical module. It turns unstructured PDF/DOCX files into structured JSON.

**Location**: `backend/screenai/services/resume_parser/parser.py`

### 3.1 The Workflow
1.  **Text Extraction (`extract_pdf_text`)**:
    *   Uses `pdfplumber` to read text layer of PDF.
2.  **Prompt Engineering (`parse_prompt`)**:
    *   A large text block sent to Gemini: *"Extract candidate_name, email, skills... Return JSON."*
3.  **LLM Call (`get_llm`)**:
    *   Uses `langchain_google_genai` wrapper.
    *   **Smart Feature**: Rotates through multiple API Keys (`GEMINI_API_KEY_1`, `_2`...) if Quota is hit.
4.  **Fallback Logic**:
    *   If AI fails, it executes `scan_resume_regex` to at least find Email and Phone using Regular Expressions.

---

## 📚 Module 4: The Frontend (React)

The frontend is built with modular components.

### 4.1 Key Pages
*   **`ApplyPage.js`**:
    *   **Role**: The public form.
    *   **Tech**: Uses `FormData` to handle file uploads.
    *   **State**: `formData` object tracks 15+ fields (Name, Experience, Answers).
    *   **Logic**: `handleResumeAutoFill` updates the state when a file is dropped.
*   **`DashboardPage.js`**:
    *   **Role**: The recruiter's home.
    *   **Tech**: `recharts` library for the Bar and Line charts.
    *   **Data**: Fetches 6 different metrics from the backend on load.

### 4.2 Services (`services/api.js`)
*   **Role**: The bridge between Front and Back.
*   **Implementation**: A centralized `axios` instance.
*   **Why**: Makes it easy to change the Base URL in one place.

---

## 📚 Module 5: Database Schema (Mental Map)

*   **Employee** (Recruiter)
    *   *One-to-Many* -> **JobPosting**
        *   *One-to-Many* -> **Application**
            *   *One-to-One* -> **Candidate**
            *   *One-to-Many* -> **ApplicationComment**

---

## 📚 Module 6: How to Read the Code (Recommended Order)

1.  **Start with Data**: Read `backend/jobs/models.py` and `backend/candidates/models.py`. Understanding the data structure makes the rest obvious.
2.  **Follow the User**:
    *   Read `frontend/src/pages/ApplyPage.js` (The input).
    *   Read `backend/candidates/views.py` (The processing).
    *   Read `backend/screenai/services/resume_parser/parser.py` (The intelligence).
3.  **See the Result**:
    *   Read `backend/appscreenai/api_views.py` (The output/analytics).

---

## Summary of Key Commands

*   **Start Backend**: `python manage.py runserver`
*   **Start Frontend**: `npm start`
*   **Create Admin**: `python manage.py createsuperuser`
