import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import JobListPage from './pages/JobListPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplyPage from './pages/ApplyPage';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';

import CreateJobPage from './pages/CreateJobPage';
import CreateEmployee from './components/CreateEmployee';
import ViewEmployees from './components/ViewEmployees';
import AdminLayout from './components/AdminLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CandidateJobBoard from './pages/CandidateJobBoard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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

          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}


// Wrappers to ensure they can navigate back using the new Router
const CreateEmployeeWithNav = () => <CreateEmployee onBack={() => window.history.back()} />;
const ViewEmployeesWithNav = () => <ViewEmployees onBack={() => window.history.back()} />;