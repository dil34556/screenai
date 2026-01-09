import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  Search,
  MoreVertical,
  Shield,
  Key,
  Mail,
  User,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      await deleteEmployee(id);
      fetchEmployees();
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
  // Removed bg-slate-50, using transparent to let the global midnight bg show through
  const containerClasses = 'min-h-screen p-6 md:p-8 animate-fade-in';

  return (
    <div className={containerClasses}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight font-heading">
              {readOnly ? 'Employee Directory' : 'Team Members'}
            </h1>
            <p className="text-muted-foreground mt-1 font-light">Manage access and view team details.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchEmployees}
              className="flex items-center gap-2 bg-secondary/50 text-muted-foreground border border-border/10 px-4 py-2 rounded-xl font-medium hover:bg-secondary/80 hover:text-foreground transition shadow-sm backdrop-blur-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="glass-panel overflow-hidden shadow-2xl rounded-2xl relative">
          {/* Table Header Gradient - subtle top accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50" />

          {loading ? (
            <div className="flex justify-center items-center h-64 text-indigo-400">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 bg-red-900/10">
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">{error}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground/30">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>No employees found</p>
            </div>
          ) : (
            <div className="gemini-grid-container custom-scrollbar max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="gemini-grid-header">
                  <tr>
                    <th className="py-4 px-6">Employee</th>
                    {!readOnly && <th className="py-4 px-6">Role</th>}
                    {!readOnly && <th className="py-4 px-6">Credentials</th>}
                    {!readOnly && <th className="py-4 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {employees.map((employee, index) => (
                    <tr key={employee.id} className="gemini-grid-row group">
                      <td className="gemini-grid-cell">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold border border-border/10 shadow-inner">
                            {employee.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{employee.email}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {index + 1}</p>
                          </div>
                        </div>
                      </td>
                      {!readOnly && (
                        <td className="gemini-grid-cell">
                          <span className="gemini-grid-chip bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Admin
                          </span>
                        </td>
                      )}
                      {!readOnly && (
                        <td className="gemini-grid-cell">
                          <div className="flex items-center gap-2 text-muted-foreground px-2 py-1 rounded-md font-mono text-xs">
                            <Key size={12} />
                            ••••••••
                          </div>
                        </td>
                      )}
                      {!readOnly && (
                        <td className="gemini-grid-cell text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => openUpdateModal(employee)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/20 rounded-full transition-colors"
                              title="Reset Password"
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border/10"
            >
              <div className="p-6 border-b border-border/5 flex justify-between items-center bg-secondary/10">
                <h2 className="text-lg font-bold text-foreground font-heading">Update Access</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-indigo-500/10 text-indigo-300 rounded-xl border border-indigo-500/20">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <User size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400/80 font-bold uppercase tracking-wider">Updating User</p>
                    <span className="font-bold text-foreground">{selectedEmployee?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl transition-all outline-none"
                      placeholder="Enter secure password"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/5 flex justify-end gap-3 bg-secondary/10">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary/20 hover:text-foreground rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewEmployees;
