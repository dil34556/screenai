import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApplications, getJobDetail } from '../services/api';

const ApplicationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState(null);

    // Filter State (Sync with URL)
    const currentStatus = searchParams.get('status') || '';
    const currentJobId = searchParams.get('job') || '';

    useEffect(() => {
        loadApplications();
        if (currentJobId) {
            loadJobDetails(currentJobId);
        } else {
            setJobDetails(null);
        }
    }, [currentStatus, currentJobId]);

    const loadJobDetails = async (id) => {
        try {
            const data = await getJobDetail(id);
            setJobDetails(data);
        } catch (error) {
            console.error("Failed to load job details", error);
        }
    };

    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const loadApplications = async (url = null) => {
        setLoading(true);
        try {
            let data;
            if (url) {
                // Extract params from full URL if provided (Next/Prev)
                const urlObj = new URL(url);
                const params = Object.fromEntries(urlObj.searchParams.entries());
                // Ensure auth headers are passed by using our api wrapper, but api wrapper expects endpoint not full URL.
                // Actually api.get takes a URL. If it's absolute, axios might ignore baseURL?
                // Re-using getApplications with params is safer.
                data = await getApplications(params);
            } else {
                const params = {};
                if (currentStatus) params.status = currentStatus;
                if (currentJobId) params.job = currentJobId;
                data = await getApplications(params);
            }

            if (data.results) {
                setApplications(data.results);
                setNextPage(data.next);
                setPrevPage(data.prev || data.previous); // DRF uses 'previous'
            } else {
                setApplications(data);
                setNextPage(null);
                setPrevPage(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        const newParams = { status: val };
        if (currentJobId) newParams.job = currentJobId; // Preserve job filter

        if (val) {
            setSearchParams(newParams);
        } else {
            const cleanParams = {};
            if (currentJobId) cleanParams.job = currentJobId;
            setSearchParams(cleanParams);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'NEW': 'bg-blue-100 text-blue-800',
            'SCREENED': 'bg-indigo-100 text-indigo-800',
            'INTERVIEW': 'bg-purple-100 text-purple-800',
            'OFFER': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-8 font-sans text-foreground pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {jobDetails ? `Candidates for ${jobDetails.title}` : 'All Applications'}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {jobDetails
                                ? `Viewing applicants for ${jobDetails.title} (${jobDetails.location})`
                                : 'Manage and screen candidates across all active job postings.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={currentStatus}
                            onChange={handleStatusChange}
                            className="glass-input max-w-xs"
                        >
                            <option value="">All Statuses</option>
                            <option value="NEW">New</option>
                            <option value="SCREENED">Screened</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Applications Table Card */}
                <div className="card-standard overflow-hidden animate-slide-up stagger-1">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground font-medium">Loading applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl text-gray-400">∅</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">No applications found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="gemini-grid-container custom-scrollbar max-h-[700px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="gemini-grid-header">
                                    <tr>
                                        <th className="py-4 px-6">Candidate</th>
                                        <th className="py-4 px-6">Job Role</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6">Applied Date</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/10">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="gemini-grid-row group">
                                            <td className="gemini-grid-cell">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                        {app.candidate_details.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-foreground">{app.candidate_details.name}</div>
                                                        <div className="text-xs text-muted-foreground">{app.candidate_details.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="gemini-grid-cell">
                                                <div className="text-sm font-medium text-foreground">{app.job_title}</div>
                                                <div className="text-xs text-muted-foreground font-mono">ID: #{app.job}</div>
                                            </td>
                                            <td className="gemini-grid-cell">
                                                <span className={`gemini-grid-chip ${app.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    app.status === 'SCREENED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                        app.status === 'INTERVIEW' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            app.status === 'OFFER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'OFFER' ? 'bg-emerald-500' :
                                                        app.status === 'REJECTED' ? 'bg-red-500' :
                                                            'bg-current'
                                                        }`} />
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="gemini-grid-cell text-muted-foreground font-mono text-xs">
                                                {new Date(app.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="gemini-grid-cell text-right">
                                                <a
                                                    href={`/admin/jobs/${app.job}`}
                                                    className="inline-flex items-center justify-center px-4 py-1.5 border border-border/10 shadow-sm text-xs font-medium rounded-full text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-colors"
                                                >
                                                    View Details
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="border-t border-border/10 bg-card/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between sm:px-6 rounded-b-[16px]">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Displaying results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => loadApplications(prevPage)}
                                        disabled={!prevPage}
                                        className={`relative inline-flex items-center rounded-l-xl px-3 py-2 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-border/20 hover:bg-secondary/50 focus:z-20 focus:outline-offset-0 ${!prevPage ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => loadApplications(nextPage)}
                                        disabled={!nextPage}
                                        className={`relative inline-flex items-center rounded-r-xl px-3 py-2 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-border/20 hover:bg-secondary/50 focus:z-20 focus:outline-offset-0 ${!nextPage ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ApplicationsPage;
