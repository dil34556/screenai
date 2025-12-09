import React from 'react';

function Home({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Employee Management System
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onNavigate('create')}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">➕</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Create Employee
              </h2>
              <p className="text-gray-600">Add a new employee to the system</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('view')}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                View Employees
              </h2>
              <p className="text-gray-600">See all registered employees</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
