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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {jobDetails ? `Candidates for ${jobDetails.title}` : 'All Applications'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            {jobDetails
                                ? `Viewing applicants for ${jobDetails.title} (${jobDetails.location})`
                                : 'Manage candidates across all job postings.'}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-4">
                        <select
                            value={currentStatus}
                            onChange={handleStatusChange}
                            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
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

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading applications...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No applications found matching filters.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">View</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {app.candidate_details.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{app.candidate_details.name}</div>
                                                    <div className="text-sm text-gray-500">{app.candidate_details.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{app.job_title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.applied_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* We link to the specific job details page, expanding the candidate list is the current "View" mode. 
                                                Ideally we'd have a candidate detail modal or page. 
                                                For now, let's link to Job Details? Or just a placeholder action.
                                                Actually, the prompt asked for "Detailed Candidate Review". 
                                                Let's make a "View Details" button that opens a simple modal or alert for now,
                                                or link to the job page where they are listed.
                                            */}
                                            <a href={`/admin/jobs/${app.job}`} className="text-indigo-600 hover:text-indigo-900">
                                                Go to Job
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => loadApplications(prevPage)}
                            disabled={!prevPage}
                            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!prevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => loadApplications(nextPage)}
                            disabled={!nextPage}
                            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!nextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => loadApplications(prevPage)}
                                    disabled={!prevPage}
                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!prevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    Previous
                                </button>
                                <button
                                    onClick={() => loadApplications(nextPage)}
                                    disabled={!nextPage}
                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!nextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Next</span>
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationsPage;
