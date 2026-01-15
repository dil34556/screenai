import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-lg">
            Manage System & Employees
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin/users/create')}
            className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:ring-1 hover:ring-indigo-600 transition-all text-left shadow-sm hover:shadow-md"
          >
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span className="text-xl font-bold">+</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Create Employee
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Add new staff members to the system.
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:ring-1 hover:ring-indigo-600 transition-all text-left shadow-sm hover:shadow-md"
          >
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span className="text-xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              View Employees
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Update details or remove accounts.
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/employeeAnalysis')}
            className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:ring-1 hover:ring-indigo-600 transition-all text-left shadow-sm hover:shadow-md"
          >
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Employee Analysis
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              View recruitment performance by employee.
            </p>
          </button>
        </div>

        <div className="mt-12 text-center border-t border-slate-200 pt-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-indigo-600 transition-colors"
          >
            ← Back to Main Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
