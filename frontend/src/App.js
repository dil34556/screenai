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
import AdminHome from './components/AdminHome';
import AdminLogin from './components/AdminLogin';

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

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminHome />} />

        {/* Recruiter Portal with Sidebar Layout */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portal/employees" element={<ViewEmployees readOnly={true} />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/jobs/create" element={<CreateJobPage />} />
          <Route path="/admin/jobs" element={<JobListPage />} />
          <Route path="/admin/jobs/:jobId" element={<JobDetailsPage />} />
        </Route>

        <Route path="/admin/users" element={<ViewEmployees onBack={() => window.location.href = '/'} />} />
        <Route path="/admin/users/create" element={<CreateEmployee onBack={() => window.location.href = '/'} />} />

        {/* Legacy/Other Routes */}

        {/*
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} /> 
          ...
        </Route>
        */}
      </Routes>
    </Router>
  );
}


// Wrappers to ensure they can navigate back using the new Router
const CreateEmployeeWithNav = () => <CreateEmployee onBack={() => window.history.back()} />;
const ViewEmployeesWithNav = () => <ViewEmployees onBack={() => window.history.back()} />;