import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, LayoutDashboard, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Screen<span className="text-indigo-600">AI</span></span>
                    </div>
                    <div className="text-sm text-slate-500">v2.0</div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-medium mb-6 backdrop-blur-sm">
                        <Sparkles size={12} />
                        <span>AI-Powered Recruitment Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                        Intelligent Hiring for <br />
                        <span className="text-indigo-400">Modern Teams</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Streamline your recruitment process with automated screening, smart pipelines, and data-driven insights.
                    </p>
                </div>
            </div>

            {/* Role Selection Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Candidate Card */}
                    <Link to="/jobs" className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-100 flex flex-col items-center text-center transform hover:-translate-y-1">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Briefcase size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">I am a Candidate</h2>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Browse open positions, upload your resume, and track your application status.
                        </p>
                        <span className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-2">
                            Browse Jobs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>

                    {/* Recruiter Card */}
                    <Link to="/admin/dashboard" className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-100 flex flex-col items-center text-center transform hover:-translate-y-1">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <LayoutDashboard size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Recruiter Portal</h2>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Manage job postings, screen candidates with AI, and schedule interviews.
                        </p>
                        <span className="text-indigo-600 font-semibold group-hover:text-indigo-700 flex items-center gap-2">
                            Go to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>

                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">© 2025 ScreenAI Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"><ShieldCheck size={14} /> Secure & Private</span>
                        <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-slate-600 cursor-pointer">Terms</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
