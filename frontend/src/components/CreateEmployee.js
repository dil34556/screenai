import React, { useState } from 'react';
import { User, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { createEmployee } from '../services/api';
import { motion } from 'framer-motion';

function CreateEmployee({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createEmployee({ email, password });
      setCompleted(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCompleted(false);
    setError('');
    setEmail('');
    setPassword('');
  };

  if (completed) {
    return (
      <div className="min-h-screen p-6 md:p-8 animate-fade-in flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>

          <div className="glass-panel p-12 text-center rounded-[24px] relative overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
            {/* Decorational Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16" />

            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-sm border border-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>

            <h2 className="text-3xl font-heading font-light text-white mb-3 tracking-tight">Employee Added!</h2>
            <p className="text-white/40 mb-8 leading-relaxed font-light">
              The new team member has been successfully added to the directory.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20"
              >
                Add Another Member
              </button>
              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 font-medium transition-all"
              >
                Return to Directory
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 animate-fade-in flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="glass-panel p-8 md:p-10 rounded-[24px] relative overflow-hidden">
          {/* Decorational Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16" />

          <h1 className="text-4xl font-heading font-light text-white mb-2 tracking-tight">Add Team Member</h1>
          <p className="text-white/40 font-light mb-8">Create a new account for an employee.</p>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wilder mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none"
                  placeholder="employee@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none"
                  placeholder="Create a secure password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4B90FF]/20 to-[#FF55D2]/20 text-[#4B90FF] py-4 px-6 rounded-full hover:from-[#4B90FF] hover:to-[#FF55D2] hover:text-white hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all font-medium text-sm tracking-wide mt-4 border border-white/5"
            >
              {loading ? 'Creating Account...' : 'Create Employee Account'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateEmployee;
