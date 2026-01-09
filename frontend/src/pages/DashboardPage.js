import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    Briefcase,
    Clock,
    Zap,
    ArrowRight,
    Search,
    Plus,
    Activity,
    Sparkles,
    MoreHorizontal,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { getDashboardStats, getApplications } from '../services/api';
import Skeleton from '../components/Skeleton';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_candidates: 0, today_candidates: 0, status_breakdown: [] });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const statsData = await getDashboardStats();
                const appsData = await getApplications();
                setApplications(appsData.results || appsData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // LOADING SKELETON
    if (loading) return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-md bg-white/5" />
                    <Skeleton className="h-4 w-64 rounded-md bg-white/5" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-32 rounded-md bg-white/5" />
                    <Skeleton className="h-9 w-40 rounded-md bg-white/5" />
                </div>
            </div>

            {/* Metric Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-56 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-96 w-full rounded-xl bg-white/5" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
                </div>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = {
            'NEW': 'bg-blue-500/20 text-blue-300 border-blue-500/20',
            'SCREENED': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20',
            'INTERVIEW': 'bg-purple-500/20 text-purple-300 border-purple-500/20',
            'OFFER': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
            'REJECTED': 'bg-rose-500/20 text-rose-300 border-rose-500/20',
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide border ${styles[status] || 'bg-white/10 text-white'}`}>
                {status}
            </span>
        );
    };

    const handleExport = () => {
        if (!applications || applications.length === 0) {
            alert("No data to export.");
            return;
        }

        // 1. Define CSV Headers
        const headers = ["Candidate Name", "Email", "Phone", "Job Title", "Status", "Applied Date", "Experience (Yrs)", "Skills"];

        // 2. Format Data Rows
        const rows = applications.map(app => [
            `"${app.candidate_details.name || ''}"`,
            `"${app.candidate_details.email || ''}"`,
            `"${app.candidate_details.phone || ''}"`,
            `"${app.job_title || ''}"`,
            `"${app.status || ''}"`,
            `"${new Date(app.applied_at).toLocaleDateString()}"`,
            `"${app.candidate_details.experience_years || ''}"`,
            `"${(app.candidate_details.skills || []).join(', ')}"`
        ]);

        // 3. Combine to CSV String
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // 4. Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `candidates_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 pt-2">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-light text-foreground tracking-tight leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-light leading-relaxed">
                        Welcome back, Admin. Your automated pipeline is active.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="h-12 px-6 rounded-full bg-secondary/50 hover:bg-secondary text-foreground text-sm font-semibold transition-all border border-border flex items-center gap-2"
                    >
                        <FileText size={18} />
                        <span>Export Report</span>
                    </button>
                    <Link
                        to="/admin/jobs/create"
                        className="h-12 px-8 rounded-full bg-gradient-to-r from-[#4B90FF]/20 to-[#FF55D2]/20 text-[#4B90FF] text-sm font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg border border-white/5 hover:shadow-glow hover:from-[#4B90FF] hover:to-[#FF55D2] hover:text-white"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        <span>Create Job</span>
                    </Link>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Candidates"
                    value={stats.total_candidates}
                    trend="+12%"
                    icon={Users}
                />
                <MetricCard
                    title="Active Jobs"
                    value="8"
                    trend="+2 new"
                    icon={Briefcase}
                />
                <MetricCard
                    title="Interviews Today"
                    value={stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                    trend="Scheduled"
                    icon={Clock}
                />

            </div>

            <div className="space-y-8">
                {/* Main Content Area - Full Width */}
                <div className="space-y-8">

                    {/* Pipeline Status - Glass Panel */}
                    <div className="glass-panel rounded-[24px] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-medium text-foreground">Pipeline Status</h3>
                            <button
                                onClick={() => navigate('/admin/applications')}
                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                        <PipelineStat
                            label="Interviewing"
                            count={stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                            color="bg-purple-500"
                            onClick={() => navigate('/admin/applications?status=INTERVIEW')}
                        />
                        <PipelineStat
                            label="Offers"
                            count={stats.status_breakdown.find(s => s.status === 'OFFER')?.count || 0}
                            color="bg-emerald-500"
                            onClick={() => navigate('/admin/applications?status=OFFER')}
                        />
                    </div>
                </div>

                {/* Applications Table - Clean Glass */}
                <div className="glass-panel rounded-[24px] overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-medium text-foreground">Recent Applications</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-input/20 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/20 placeholder:text-muted-foreground text-foreground transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                            <thead className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-4 py-2">Candidate</th>
                                    <th className="px-4 py-2">Role</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2 text-right">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.slice(0, 5).map((app) => (
                                    <tr key={app.id} className="group hover:bg-muted/50 transition-all duration-300 rounded-xl cursor-pointer">
                                        <td className="px-4 py-4 rounded-l-xl">
                                            <div className="font-medium text-foreground">{app.candidate_details.name}</div>
                                            <div className="text-xs text-muted-foreground font-light mt-0.5">{app.candidate_details.email}</div>
                                        </td>
                                        <td className="px-4 py-4 font-light text-foreground/80">{app.job_title}</td>
                                        <td className="px-4 py-4">{getStatusBadge(app.status)}</td>
                                        <td className="px-4 py-4 rounded-r-xl text-right text-muted-foreground font-mono text-xs">
                                            {new Date(app.applied_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-white/30">
                                            No recent applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="pt-6 text-center border-t border-white/5 mt-2">
                        <Link to="/admin/applications" className="inline-block px-6 py-2 rounded-full hover:bg-white/5 font-medium text-sm text-white/60 hover:text-white transition-all">
                            View All Candidates
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
};

// --- Sub-Components ---

const MetricCard = ({ title, value, trend, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel p-6 rounded-[24px] group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 transition-opacity opacity-0 group-hover:opacity-100" />

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-secondary/50 rounded-2xl text-foreground group-hover:bg-secondary transition-colors duration-300">
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {trend}
            </span>
        </div>
        <div className="text-4xl font-heading font-medium text-foreground tracking-tight mb-2 relative z-10">{value}</div>
        <div className="text-sm font-light text-muted-foreground relative z-10">{title}</div>
    </motion.div>
);

const PipelineStat = ({ label, count, color, onClick }) => (
    <div
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer border border-border/50 hover:scale-105 transform duration-200"
    >
        <div className="text-2xl font-bold text-foreground mb-2">{count}</div>
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('bg-', 'bg-')}`}></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    </div>
);


export default DashboardPage;
