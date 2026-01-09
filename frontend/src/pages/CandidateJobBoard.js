import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';
import { Briefcase, MapPin, Calendar, ArrowRight, Sparkles, Search, FileX2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const CandidateJobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                // Handle pagination
                const jobList = Array.isArray(data) ? data : (data.results || []);
                setJobs(jobList);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary">
            {/* Premium Hero Section */}
            <div className="relative bg-card pb-16 pt-24 lg:pb-32 lg:pt-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(79,70,229,0.05),transparent)]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
                    <div className="mx-auto max-w-3xl animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-bold uppercase tracking-widest mb-8 shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform">
                            <Sparkles size={12} className="text-indigo-400" />
                            <span>Careers at ScreenAI</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl font-heading mb-6 tight-tracking">
                            Build the <span className="text-indigo-500">future</span> of work.
                        </h1>
                        <p className="mt-6 text-xl leading-8 text-muted-foreground font-light max-w-2xl mx-auto">
                            Join a team of visionaries, builders, and dreamers. We're hiring across all roles to help companies find the best talent.
                        </p>
                    </div>
                </div>
            </div>

            {/* Job Grid */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24 -mt-12 relative z-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-panel p-6 flex flex-col h-64">
                                <div className="flex justify-between items-start mb-6">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <Skeleton className="w-16 h-6 rounded-md" />
                                </div>
                                <div className="space-y-3 mb-6">
                                    <Skeleton className="w-3/4 h-8 rounded-lg" />
                                    <div className="flex gap-4">
                                        <Skeleton className="w-24 h-4" />
                                        <Skeleton className="w-32 h-4" />
                                    </div>
                                </div>
                                <div className="mt-auto border-t border-border/10 pt-6">
                                    <Skeleton className="w-full h-10 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job, index) => (
                            <div
                                key={job.id}
                                className="glass-panel p-6 flex flex-col hover:-translate-y-2 hover:shadow-glass-strong transition-all duration-300 group animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <Briefcase size={22} strokeWidth={2} />
                                        </div>
                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-md border ${job.job_type === 'REMOTE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                            {job.job_type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-indigo-500 transition-colors">
                                        {job.title}
                                    </h3>

                                    <div className="flex flex-col gap-2 mb-4 text-sm text-muted-foreground font-medium">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-blue-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-purple-400" />
                                            Posted {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground/80 leading-relaxed mb-6 line-clamp-3">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="border-t border-border/30 pt-6 mt-auto">
                                    <Link
                                        to={`/jobs/${job.id}/apply`}
                                        className="btn-gemini w-full flex items-center justify-center gap-2 group-hover:shadow-indigo-500/40"
                                    >
                                        <span>Apply Now</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {jobs.length === 0 && (
                            <div className="col-span-full">
                                <EmptyState
                                    icon={FileX2}
                                    title="No openings right now"
                                    description="We're currently not hiring for any positions. Please check back later for new opportunities."
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CandidateJobBoard;
