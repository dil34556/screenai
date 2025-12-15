import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getJobs, updateJob } from '../services/api';
import { MoreVertical, Copy, ExternalLink, Users } from 'lucide-react';
// Removed FormPreviewModal and unused icons

const JobListPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    const [activeMenuId, setActiveMenuId] = useState(null); // For custom dropdown

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Feedback state for copy buttons
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch ALL jobs, including closed ones
                // Fetch ALL jobs, including closed ones
                const data = await getJobs({ include_closed: 'true' });
                // Handle pagination
                const jobsList = data.results || data;
                setJobs(jobsList);
                setFilteredJobs(jobsList);
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

        // 1. Search Filter
        if (searchTerm) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Status Filter
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
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2s
    };

    const handleToggleStatus = async (job) => {
        const newStatus = !job.is_active;
        try {
            // Optimistic update
            const updatedJobs = jobs.map(j => j.id === job.id ? { ...j, is_active: newStatus } : j);
            setJobs(updatedJobs);

            // Persist
            await updateJob(job.id, { is_active: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on error
            alert("Failed to update job status.");
            setJobs(jobs);
        }
    };

    const getJobTypeBadgeClass = (type) => {
        switch (type?.toUpperCase()) {
            case 'REMOTE':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'HYBRID':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'ONSITE':
                return 'bg-purple-100 text-purple-800 border border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-gray-500">
            <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24"></svg>
            Loading Jobs...
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
                    <p className="mt-1 text-sm text-gray-600">Overview of all current job postings</p>
                </div>
                <Link to="/admin/jobs/create" className="btn-primary flex items-center justify-center gap-2">
                    <span>+</span> Post New Job
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-gray-100">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by title or location..."
                        className="input-premium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="input-premium appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Closed</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-transparent">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="bg-white hover:shadow-md transition-shadow duration-200 border border-gray-100 rounded-xl mb-4 mx-4 mt-4 overflow-hidden">
                            <div className="p-5">
                                {/* Header Row: Badge & Menu */}
                                <div className="flex justify-between items-start mb-3">
                                    <button
                                        onClick={() => handleToggleStatus(job)}
                                        className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full cursor-pointer transition-colors ${job.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                        title="Click to toggle status"
                                    >
                                        {job.is_active ? 'Active' : 'Closed'}
                                    </button>

                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === job.id ? null : job.id);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {/* Dropdown */}
                                        {activeMenuId === job.id && (
                                            <div
                                                className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-in fade-in zoom-in-95 duration-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="p-1">
                                                    <a
                                                        href={`/jobs/${job.id}/apply`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="group flex w-full items-center rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                    >
                                                        <ExternalLink size={16} className="mr-2" />
                                                        Open Form
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title & Subtitle */}
                                <div className="mb-4">
                                    <Link to={`/admin/jobs/${job.id}`} className="block">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    </Link>
                                    <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                        <span>{job.department}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{job.location}</span>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="border-t border-gray-100 my-4"></div>

                                {/* Target Criteria (New) */}
                                {(job.previous_companies?.length > 0 || job.previous_roles?.length > 0) && (
                                    <div className="mb-4 space-y-2">
                                        {job.previous_companies?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Prev. Co:</span>
                                                {job.previous_companies.slice(0, 3).map((co, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                        {co}
                                                    </span>
                                                ))}
                                                {job.previous_companies.length > 3 && <span className="text-xs text-gray-400">+{job.previous_companies.length - 3}</span>}
                                            </div>
                                        )}
                                        {job.previous_roles?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Prev. Roles:</span>
                                                {job.previous_roles.slice(0, 3).map((role, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                                        {role}
                                                    </span>
                                                ))}
                                                {job.previous_roles.length > 3 && <span className="text-xs text-gray-400">+{job.previous_roles.length - 3}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center text-gray-600 font-medium">
                                        <Users size={18} className="mr-2 text-gray-400" />
                                        <span>{job.application_count || 0} applicants</span>
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getJobTypeBadgeClass(job.job_type)}`}>
                                        {job.job_type}
                                    </span>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/admin/jobs/${job.id}`}
                                        className="flex-1 bg-white border border-gray-200 text-gray-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-semibold py-2.5 px-4 rounded-lg text-center transition-all duration-200 shadow-sm"
                                    >
                                        View Candidates
                                    </Link>
                                    <button
                                        onClick={() => copyApplyLink(job.id)}
                                        className={`flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-200 ${copiedId === job.id
                                            ? 'bg-green-50 text-green-600 border-green-200'
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                        title="Copy Application Link"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}

                    {filteredJobs.length === 0 && (
                        <li className="px-4 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
                                <span className="text-xl">🔍</span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No jobs found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                        </li>
                    )}
                </ul>
            </div>

        </div >
    );
};

export default JobListPage;
