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
    const [stats, setStats] = useState({ total_candidates: 0, today_candidates: 0, status_breakdown: [], platform_breakdown: [] });
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
            'HIRED': 'bg-green-600/20 text-green-400 border-green-600/20',
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
        <div className="h-full overflow-y-auto px-6 pb-6 space-y-8 animate-fade-in custom-scrollbar">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 pt-2">
                <div>
                    <h1 className="text-[28px] font-normal text-[#1F1F1F] dark:text-white tracking-tight leading-tight">
                        Dashboard
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="h-10 px-6 rounded-full bg-white dark:bg-[#2b2d30] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                        <FileText size={18} />
                        <span>Export Report</span>
                    </button>
                    <Link
                        to="/admin/jobs/create"
                        className="h-10 px-6 rounded-[16px] bg-[#C2E7FF] dark:bg-[#004a77] text-[#001D35] dark:text-[#c2e7ff] text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
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
                    value={stats.total_candidates || 0}
                    trend="+12%"
                    icon={Users}
                    onClick={() => navigate('/admin/applications')}
                />
                <MetricCard
                    title="Active Jobs"
                    value={stats.active_jobs || 0}
                    trend="In Pipeline"
                    icon={Briefcase}
                    onClick={() => navigate('/admin/jobs')}
                />
                <MetricCard
                    title="Interviews Today"
                    value={stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                    trend="Scheduled"
                    icon={Clock}
                    onClick={() => navigate('/admin/applications?status=INTERVIEW')}
                />

            </div>

            <div className="space-y-8">
                {/* Main Content Area - Full Width */}
                <div className="space-y-8">

                    {/* Pipeline Status */}
                    <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-white/10 rounded-[24px] p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-normal text-[#1F1F1F] dark:text-white">Status</h3>
                            <button
                                onClick={() => navigate('/admin/applications')}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PipelineStat
                                label="Interviewing"
                                count={stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                                color="bg-purple-600"
                                onClick={() => navigate('/admin/applications?status=INTERVIEW')}
                            />
                            <PipelineStat
                                label="Offers"
                                count={stats.status_breakdown.find(s => s.status === 'OFFER')?.count || 0}
                                color="bg-green-600"
                                onClick={() => navigate('/admin/applications?status=OFFER')}
                            />
                            {/* Platform Stats */}
                            {stats.platform_breakdown && stats.platform_breakdown.map((platform) => (
                                <PipelineStat
                                    key={platform.platform}
                                    label={platform.platform}
                                    count={platform.count}
                                    color="bg-blue-600"
                                    onClick={() => navigate(`/go-through?platform=${encodeURIComponent(platform.platform)}`)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Applications Table - Clean Material */}
                <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-white/10 rounded-[24px] overflow-hidden">
                    <div className="flex items-center justify-between p-6">
                        <h3 className="text-xl font-normal text-[#1F1F1F] dark:text-white">Recent Applications</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-[#F0F2F5] dark:bg-[#2b2d30] border-none rounded-full pl-12 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500 text-gray-900 dark:text-gray-100 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-y-0">
                            <thead className="text-gray-500 dark:text-gray-400 font-medium text-xs bg-[#F8F9FA] dark:bg-[#111418] border-b border-gray-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-white/10 font-medium">Candidate</th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-white/10 font-medium">Role</th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-white/10 font-medium">Status</th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-white/10 text-right font-medium">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.slice(0, 5).map((app) => (
                                    <tr key={app.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                                            <div className="font-medium text-[#1F1F1F] dark:text-gray-200">{app.candidate_details.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{app.candidate_details.email}</div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-100 dark:border-white/5 text-[#1F1F1F] dark:text-gray-200">{app.job_title}</td>
                                        <td className="px-6 py-4 border-b border-gray-100 dark:border-white/5">{getStatusBadge(app.status)}</td>
                                        <td className="px-6 py-4 border-b border-gray-100 dark:border-white/5 text-right text-gray-500 text-xs">
                                            {new Date(app.applied_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            No recent applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const MetricCard = ({ title, value, trend, icon: Icon, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-white/10 rounded-[24px] p-6 group transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${onClick ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${trend.includes('+') ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
                {trend}
            </span>
        </div>
        <div className="text-5xl font-normal text-[#1F1F1F] dark:text-white tracking-tight mb-2">{value}</div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</div>
    </div>
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
