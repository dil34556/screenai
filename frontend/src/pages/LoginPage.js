import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { Mail, Lock, AlertCircle, ArrowRight, LayoutDashboard, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await login({ email, password });
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-sans text-foreground relative overflow-hidden selection:bg-primary/30 selection:text-primary">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 pointer-events-none"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-fade-in">

                {/* Brand / Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow mb-6">
                        <LayoutDashboard className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-heading font-light tracking-tight text-foreground text-center mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground font-light text-center">
                        Modern Recruitment Platform
                    </p>
                </div>

                {/* Glass Login Card */}
                <div className="glass-panel p-8 md:p-10 rounded-[32px] border border-border/10 shadow-2xl relative overflow-hidden">
                    {/* Inner Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16" />

                    <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium animate-shake">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" className="h-4 w-4 rounded border-border/10 bg-secondary/50 text-indigo-500 focus:ring-primary/50 transition-colors" />
                                <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-primary hover:text-primary/80 hover:underline">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors">
                                    Create free account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center text-muted-foreground text-xs">
                    © 2024 ScreenAI Inc. • Privacy • Terms
                </div>
            </div>
        </div>
    );
};
export default LoginPage;
