import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, ShieldCheck, Sparkles, BrainCircuit, Users, BarChart3, Clock } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            S
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Screen<span className="text-indigo-600">AI</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse-slow"></div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
                        <Sparkles size={12} />
                        <span>Reinventing Recruitment</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-tight">
                        Hire Smarter, <br />
                        <span className="text-indigo-400">Faster, Better.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The all-in-one HR portal powered by advanced AI. Screen resumes, manage pipelines, and discover top talent in seconds, not days.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/dashboard"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-500/10 flex items-center justify-center gap-2 group"
                        >
                            <LayoutDashboard size={20} />
                            Access Recruiter Portal
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                    </div>

                    {/* Stats/Trust */}
                    <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> 98% Time Saved
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> AI-Powered Matching
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div> Bias Reduction
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <BrainCircuit size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">AI Resume Screening</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Automatically rank candidates based on job descriptions. Let our AI handle the initial filter so you can focus on the best.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Collaborative Hiring</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Share candidate profiles, leave notes, and make decisions together with your team in real-time.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <BarChart3 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Insightful Analytics</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Track your pipeline health, time-to-hire, and sourcing effectiveness with beautiful, actionable dashboards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Value Prop Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Why Recruiters Choose ScreenAI?</h2>
                            <p className="text-lg text-slate-600">
                                Traditional hiring is broken. We fixed it. ScreenAI brings clarity to chaos with intelligent automation.
                            </p>

                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <ShieldCheck size={14} />
                                    </div>
                                    <span className="font-medium">Bank-grade data security</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Clock size={14} />
                                    </div>
                                    <span className="font-medium">Cut hiring time by 50%</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="font-medium">95% Match Accuracy</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-3xl p-8 aspect-video flex items-center justify-center border border-slate-200 shadow-inner">
                            <div className="text-center">
                                <span className="text-6xl font-bold text-slate-300 block mb-2">10k+</span>
                                <span className="text-slate-500 font-medium">Candidates Screened</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="w-6 h-6 bg-slate-300 rounded flex items-center justify-center text-white font-bold text-xs">
                            S
                        </div>
                        <span className="text-slate-500 font-semibold">ScreenAI Inc.</span>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-slate-500">
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Contact</span>
                    </div>
                    <p className="text-sm text-slate-400">© 2025 All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
