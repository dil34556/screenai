import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';

const JobListPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const copyApplyLink = (id) => {
        const link = `${window.location.origin}/jobs/${id}/apply`;
        navigator.clipboard.writeText(link);
        alert('Compied Link: ' + link);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Jobs...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
                <Link to="/admin/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm transition">
                    + Post New Job
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                        <li key={job.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <Link to={`/admin/jobs/${job.id}`} className="text-sm font-medium text-indigo-600 truncate hover:text-indigo-800 hover:underline">
                                            {job.title}
                                        </Link>
                                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {job.job_type}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>{job.location} • Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => copyApplyLink(job.id)}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium border border-indigo-200 rounded px-3 py-1 hover:bg-indigo-50"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {jobs.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No jobs found. Create one to get started!
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default JobListPage;
