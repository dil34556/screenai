import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await login({ email, password });

            if (data.user && data.user.is_admin) {
                // Store user/token if needed, for simplicity passing flow
                localStorage.setItem('admin_user', JSON.stringify(data.user));
                navigate('/admin/dashboard');
            } else {
                setError("Access Denied: You do not have administrator permissions.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-2xl shadow-glow mb-6">
                        A
                    </div>
                    <h1 className="text-3xl font-heading font-light tracking-tight text-white">Admin Portal</h1>
                    <p className="mt-2 text-sm text-white/40">Secure access for administrators</p>
                </div>

                <div className="glass-panel p-8 sm:p-10 rounded-[32px] border border-white/[0.08] shadow-2xl relative overflow-hidden">
                    {/* Decorational Gradient */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full px-4 py-4 rounded-2xl transition-all outline-none"
                                placeholder="admin@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full px-4 py-4 rounded-2xl transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 text-rose-300 text-sm rounded-xl flex items-center gap-2 border border-rose-500/20 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:shadow-glow hover:scale-[1.02] transition-all"
                        >
                            Login to Admin Portal
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
