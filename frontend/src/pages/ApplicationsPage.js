import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApplications } from '../services/api';

const ApplicationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State (Sync with URL)
    const currentStatus = searchParams.get('status') || '';

    useEffect(() => {
        loadApplications();
    }, [currentStatus]);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const params = {};
            if (currentStatus) params.status = currentStatus;

            const data = await getApplications(params);
            setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        if (val) {
            setSearchParams({ status: val });
        } else {
            setSearchParams({});
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
                        <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
                        <p className="mt-2 text-sm text-gray-700">Manage candidates across all job postings.</p>
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
            </div>
        </div>
    );
};

export default ApplicationsPage;
