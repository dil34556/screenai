import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, updateJob } from '../services/api';
import {
    MoreVertical,
    Copy,
    ExternalLink,
    Users,
    Search,
    Filter,
    Plus,
    Briefcase,
    MapPin,
    FileX2,
    Calendar,
    ArrowUpRight,
    Check
} from 'lucide-react';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const JobListPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    // Close active menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs({ include_closed: 'true' });
                const jobList = Array.isArray(data) ? data : (data.results || []);
                setJobs(jobList);
                setFilteredJobs(jobList);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        let result = jobs;
        if (searchTerm) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'ALL') {
            const isActive = statusFilter === 'ACTIVE';
            result = result.filter(job => job.is_active === isActive);
        }
        setFilteredJobs(result);
    }, [searchTerm, statusFilter, jobs]);


    const copyApplyLink = (id) => {
        const link = `${window.location.origin}/jobs/${id}/apply`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToggleStatus = async (e, job) => {
        e.stopPropagation();
        const newStatus = !job.is_active;

        // Optimistic update
        const updatedJobs = jobs.map(j => j.id === job.id ? { ...j, is_active: newStatus } : j);
        setJobs(updatedJobs);

        try {
            await updateJob(job.id, { is_active: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on failure
            setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...j, is_active: !newStatus } : j));
        }
    };

    const getJobTypeBadge = (type) => {
        const badgeStyles = {
            'REMOTE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'HYBRID': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            'ONSITE': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${badgeStyles[type?.toUpperCase()] || 'bg-secondary text-secondary-foreground'}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-transparent text-foreground animate-fade-in pb-20 px-4 md:px-8 pt-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight">Manage Jobs</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage your open positions and hiring pipelines.</p>
                    </div>
                    <Link to="/admin/jobs/create" className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={18} />
                        <span>Create Job</span>
                    </Link>
                </div>

                {/* Controls - Flat Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card border border-border p-2 rounded-lg sticky top-4 z-20 shadow-sm">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by title or location..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-foreground py-2 pl-9 pr-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-6 w-px bg-border hidden md:block"></div>
                    <div className="relative w-full md:w-48 group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                        <select
                            className="w-full appearance-none bg-transparent font-medium text-sm text-foreground py-2 pl-9 pr-8 focus:outline-none cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Closed</option>
                        </select>
                    </div>
                </div>

                {/* List Grid - Dense System Style */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                className="group relative bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 flex flex-col h-full cursor-pointer overflow-hidden"
                            >
                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Top Row: Status & Actions */}
                                <div className="relative flex justify-between items-start mb-5">
                                    <button
                                        onClick={(e) => handleToggleStatus(e, job)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 ${job.is_active
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                            : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${job.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                        {job.is_active ? 'Active' : 'Closed'}
                                    </button>

                                    <div className="relative z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === job.id ? null : job.id);
                                            }}
                                            className="p-2 rounded-lg text-muted-foreground/50 hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {activeMenuId === job.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-popover/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl z-30 py-1 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyApplyLink(job.id); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2.5 font-medium"
                                                >
                                                    {copiedId === job.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    {copiedId === job.id ? <span className="text-emerald-500">Copied!</span> : 'Copy Link'}
                                                </button>
                                                <Link
                                                    to={`/jobs/${job.id}/apply`}
                                                    target="_blank"
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2.5 font-medium"
                                                >
                                                    <ExternalLink size={14} /> View Live
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 mb-8 relative z-10">
                                    <h3 className="text-xl font-heading font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1" title={job.title}>
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Briefcase size={14} className="text-primary/60" />
                                            <span>{job.department || 'General'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin size={14} className="text-primary/60" />
                                            <span>{job.location || 'Remote'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="pt-5 border-t border-border/50 mt-auto relative z-10">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                <Users size={14} />
                                            </div>
                                            <div className="flex flex-col leading-none">
                                                <span className="text-sm font-bold text-foreground">{job.application_count || 0}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Applicants</span>
                                            </div>
                                        </div>
                                        {getJobTypeBadge(job.job_type)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Link
                                                to={`/admin/jobs/${job.id}`}
                                                className="w-full h-10 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border text-xs font-semibold transition-all flex items-center justify-center"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                        <a
                                            href={`/jobs/${job.id}/apply`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full h-10 px-4 rounded-lg border border-primary/20 hover:bg-primary hover:text-primary-foreground text-primary/80 hover:border-primary text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                        >
                                            Open Form
                                            <ArrowUpRight size={14} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredJobs.length === 0 && (
                            <div className="col-span-full">
                                <EmptyState
                                    icon={FileX2}
                                    title="No jobs found"
                                    description="Adjust filters or create a new job posting."
                                    action={
                                        <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="btn-secondary">
                                            Clear Filters
                                        </button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListPage;
