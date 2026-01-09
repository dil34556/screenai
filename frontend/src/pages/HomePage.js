import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, ShieldCheck, Sparkles, BrainCircuit, Users, BarChart3, Clock } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-background font-sans flex flex-col selection:bg-primary/30 selection:text-primary">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            S
                        </div>
                        <span className="text-xl font-heading font-bold text-foreground tracking-tight">
                            Screen<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-gemini group flex items-center gap-2">
                            <span>Get Started</span>
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Aurora Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-blob"></div>
                    <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-indigo-100/20 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md shadow-sm animate-fade-in-up hover:scale-105 transition-transform cursor-default">
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Reinventing Recruitment</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
                        Hire Smarter, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">Faster, Better.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-300">
                        The all-in-one HR portal powered by advanced AI. Screen resumes, manage pipelines, and discover top talent in seconds, not days.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-500">
                        <Link
                            to="/dashboard"
                            className="btn-gemini px-8 py-4 text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"
                        >
                            <div className="flex items-center gap-2">
                                <LayoutDashboard size={20} />
                                Access Recruiter Portal
                            </div>
                        </Link>
                    </div>

                    {/* Stats/Trust */}
                    <div className="mt-20 pt-10 border-t border-border/60 flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground text-sm font-semibold animate-fade-in animation-delay-700">
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/50 border border-border/50 shadow-sm backdrop-blur-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            98% Time Saved
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/50 border border-border/50 shadow-sm backdrop-blur-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            AI-Powered Matching
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/50 border border-border/50 shadow-sm backdrop-blur-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                            Bias Reduction
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="glass-panel p-8 hover:-translate-y-2 hover:shadow-glass-strong transition-all duration-300 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <BrainCircuit size={32} />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-foreground mb-3 group-hover:text-indigo-500 transition-colors">AI Resume Screening</h3>
                        <p className="text-muted-foreground leading-relaxed font-medium">
                            Automatically rank candidates based on job descriptions. Let our AI handle the initial filter so you can focus on the best.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="glass-panel p-8 hover:-translate-y-2 hover:shadow-glass-strong transition-all duration-300 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-foreground mb-3 group-hover:text-purple-500 transition-colors">Collaborative Hiring</h3>
                        <p className="text-muted-foreground leading-relaxed font-medium">
                            Share candidate profiles, leave notes, and make decisions together with your team in real-time.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="glass-panel p-8 hover:-translate-y-2 hover:shadow-glass-strong transition-all duration-300 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <BarChart3 size={32} />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-foreground mb-3 group-hover:text-emerald-500 transition-colors">Insightful Analytics</h3>
                        <p className="text-muted-foreground leading-relaxed font-medium">
                            Track your pipeline health, time-to-hire, and sourcing effectiveness with beautiful, actionable dashboards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Value Prop Section */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight">
                                Why Recruiters Choose <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">ScreenAI?</span>
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Traditional hiring is broken. We fixed it. ScreenAI brings clarity to chaos with intelligent automation.
                            </p>

                            <ul className="space-y-6 pt-4">
                                <li className="flex items-center gap-4 text-muted-foreground bg-card/60 p-4 rounded-xl shadow-sm border border-border/60 hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <span className="font-bold text-lg">Bank-grade data security</span>
                                </li>
                                <li className="flex items-center gap-4 text-muted-foreground bg-card/60 p-4 rounded-xl shadow-sm border border-border/60 hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Clock size={18} />
                                    </div>
                                    <span className="font-bold text-lg">Cut hiring time by 50%</span>
                                </li>
                                <li className="flex items-center gap-4 text-muted-foreground bg-card/60 p-4 rounded-xl shadow-sm border border-border/60 hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm">
                                        <Sparkles size={18} />
                                    </div>
                                    <span className="font-bold text-lg">95% Match Accuracy</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="bg-gradient-to-br from-card to-secondary/50 rounded-[2.5rem] p-12 aspect-square flex items-center justify-center border border-border/60 shadow-glass-strong relative group">
                                <div className="absolute inset-0 bg-grid-slate-900/[0.04] mask-gradient rounded-[2.5rem]"></div>
                                <div className="text-center relative z-10 transition-transform duration-500 group-hover:scale-105">
                                    <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 block mb-4 drop-shadow-sm">10k+</span>
                                    <span className="text-xl text-muted-foreground font-bold uppercase tracking-widest">Candidates Screened</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-background/80 border-t border-border py-12 mt-auto backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
                            S
                        </div>
                        <span className="text-muted-foreground font-bold tracking-tight">ScreenAI Inc.</span>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
                        <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/80">© 2025 All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
