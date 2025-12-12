import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';

const JobListPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    // Feedback state for copy buttons
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
                setFilteredJobs(data);
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
                <Link to="/admin/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow flex items-center justify-center gap-2 transition">
                    <span>+</span> Post New Job
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-gray-100">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by title or location..."
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                            <div className="px-4 py-5 sm:px-6">
                                <div className="flex items-center justify-between">

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <Link to={`/admin/jobs/${job.id}`} className="text-lg font-medium text-indigo-600 truncate hover:text-indigo-800">
                                                {job.title}
                                            </Link>

                                            {/* Status Badge */}
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {job.is_active ? 'Active' : 'Closed'}
                                            </span>

                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {job.job_type}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                📍 {job.location} ({job.department})
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                📅 Posted on {new Date(job.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center gap-6">
                                        {/* Applicant Count */}
                                        <Link to={`/admin/applications?job=${job.id}`} className="text-center group cursor-pointer">
                                            <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600">
                                                {job.application_count || 0}
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-indigo-600">Applicants</div>
                                        </Link>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => copyApplyLink(job.id)}
                                                className={`text-sm px-3 py-1 rounded border transition ${copiedId === job.id
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {copiedId === job.id ? '✓ Copied' : 'Copy Link'}
                                            </button>
                                            <Link
                                                to={`/admin/jobs/${job.id}`}
                                                className="text-sm px-3 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-center"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>

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
        </div>
    );
};

export default JobListPage;
