import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JobListPage from './pages/JobListPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplyPage from './pages/ApplyPage';

import CreateJobPage from './pages/CreateJobPage';
import CreateEmployee from './components/CreateEmployee';
import ViewEmployees from './components/ViewEmployees';
import AdminLayout from './components/AdminLayout';

import LoginPage from './pages/LoginPage';
import CandidateJobBoard from './pages/CandidateJobBoard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Public Routes */}
        <Route path="/jobs" element={<CandidateJobBoard />} />
        <Route path="/jobs/:jobId/apply" element={<ApplyPage />} />

        {/* Admin Portal (Nested Routes) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} /> {/* Default to Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />

          <Route path="jobs" element={<JobListPage />} />
          <Route path="jobs/create" element={<CreateJobPage />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />

          <Route path="employees" element={<ViewEmployeesWithNav />} />
          <Route path="employees/create" element={<CreateEmployeeWithNav />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Wrappers to ensure they can navigate back using the new Router
const CreateEmployeeWithNav = () => <CreateEmployee onBack={() => window.history.back()} />;
const ViewEmployeesWithNav = () => <ViewEmployees onBack={() => window.history.back()} />;

const HomeWrapper = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
    <div className="max-w-4xl w-full text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">ScreenAI v2</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link to="/jobs" className="bg-white rounded-lg shadow p-8 hover:shadow-xl transition block border-t-4 border-indigo-500">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-800">I am a Candidate</h2>
          <p className="text-gray-500 mt-2">Browse & Apply for open positions</p>
        </Link>

        <Link to="/admin/dashboard" className="bg-white rounded-lg shadow p-8 hover:shadow-xl transition block border-t-4 border-gray-800">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800">Recruiter Login</h2>
          <p className="text-gray-500 mt-2">Manage Jobs & Candidates</p>
        </Link>
      </div>
    </div>
  </div>
);