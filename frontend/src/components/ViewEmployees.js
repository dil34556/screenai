import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { getEmployees, deleteEmployee, updateEmployeePassword } from '../services/api';

function ViewEmployees({ onBack, readOnly = false }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployees();
      setEmployees(data.employees || []);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      fetchEmployees(); // Refresh list
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const openUpdateModal = (employee) => {
    setSelectedEmployee(employee);
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return alert("Password cannot be empty");

    try {
      await updateEmployeePassword(selectedEmployee.id, newPassword);
      setIsModalOpen(false);
      alert("Password updated successfully");
      fetchEmployees();
    } catch (err) {
      alert("Failed to update password");
    }
  };

  // Layout Wrapper logic
  const Container = readOnly ? 'div' : 'div';
  const containerClasses = readOnly ? '' : 'min-h-screen bg-gray-50 p-8';
  return (
    <div className={containerClasses}>
      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {readOnly ? 'Employee Directory' : 'View Employees'}
            </h1>
            <button
              onClick={fetchEmployees}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading employees...</p>
          ) : error ? (
            <p className="text-red-600 text-center py-8">{error}</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No employees found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    {!readOnly && <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    {!readOnly && <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Password</th>}
                    {!readOnly && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {!readOnly && <td className="py-3 px-4 text-sm text-gray-600">#{employee.id}</td>}
                      <td className="py-3 px-4 text-sm text-gray-800 font-medium">{employee.email}</td>
                      {!readOnly && (
                        <td className="py-3 px-4 text-sm text-gray-400 font-mono tracking-widest">
                          ••••••••
                        </td>
                      )}
                      {!readOnly && (
                        <td className="py-3 px-4 text-sm text-right space-x-3">
                          <button
                            onClick={() => openUpdateModal(employee)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                            title="Edit Password"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Delete Employee"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Update Password</h2>
            <p className="text-sm text-gray-500 mb-4">Set new password for {selectedEmployee?.email}</p>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="New Password"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewEmployees;
