import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEmployee } from '../services/api';
import { Mail, Lock, AlertCircle, UserPlus, LayoutDashboard, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await createEmployee({ email, password });
            navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
            {/* Left Side: Brand/Decorative */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 lg:p-16 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-950 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-white font-heading font-bold text-xl tracking-tight">
                        <LayoutDashboard className="text-indigo-400" />
                        ScreenAI
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Start Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Smarter</span> Today
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Join thousands of recruiters using ScreenAI to automate screening and find the best talent faster.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Unlimited Job Postings',
                            'Advanced AI Analyics',
                            'One-Click Candidate Export'
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-slate-200">
                                <CheckCircle2 className="text-emerald-400" size={20} />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-slate-400 text-sm">
                    © 2024 ScreenAI Inc.
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">Create an Account</h2>
                        <p className="mt-2 text-muted-foreground">
                            Get started with your free 14-day trial.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold animate-shake">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="glass-input pl-10 w-full p-3 rounded-xl bg-input/20 border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="glass-input pl-10 w-full p-3 rounded-xl bg-input/20 border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="glass-input pl-10 w-full p-3 rounded-xl bg-input/20 border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gemini py-3 text-base shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all font-semibold">
                                    Create Account <UserPlus size={18} />
                                </span>
                            )}
                        </button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-primary/80 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
