import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApplications, getJobDetail, updateApplication } from '../services/api';

const ApplicationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState(null);

    // Filter State (Sync with URL)
    const currentStatus = searchParams.get('status') || '';
    const currentJobId = searchParams.get('job') || '';
    const currentPlatform = searchParams.get('platform') || '';

    useEffect(() => {
        loadApplications();
        if (currentJobId) {
            loadJobDetails(currentJobId);
        } else {
            setJobDetails(null);
        }
    }, [currentStatus, currentJobId, currentPlatform]);

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
                if (currentPlatform) params.platform = currentPlatform;
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
        if (currentPlatform) newParams.platform = currentPlatform; // Preserve platform filter

        if (val) {
            setSearchParams(newParams);
        } else {
            const cleanParams = {};
            if (currentJobId) cleanParams.job = currentJobId;
            if (currentPlatform) cleanParams.platform = currentPlatform;
            setSearchParams(cleanParams);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'NEW': 'bg-blue-100 text-blue-800',
            'SCREENED': 'bg-indigo-100 text-indigo-800',
            'INTERVIEW': 'bg-purple-100 text-purple-800',
            'OFFER': 'bg-green-100 text-green-800',
            'HIRED': 'bg-green-600 text-white',
            'REJECTED': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const getStatusChipStyles = (status) => {
        const styles = {
            'NEW': 'bg-blue-50 text-blue-700',
            'SCREENED': 'bg-indigo-50 text-indigo-700',
            'INTERVIEW': 'bg-purple-50 text-purple-700',
            'OFFER': 'bg-green-50 text-green-700',
            'HIRED': 'bg-green-600/10 text-green-700',
            'REJECTED': 'bg-red-50 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    // Filter applications based on search
    const filteredApps = applications.filter(app =>
        app.candidate_details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_details.email.toLowerCase().includes(searchQuery.toLowerCase())
    );



    // Rejection Reason Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedAppForReject, setSelectedAppForReject] = useState(null);
    const [viewReasonModal, setViewReasonModal] = useState(null); // For viewing reason

    const updateStatus = async (id, newStatus, reason = null) => {
        try {
            await updateApplication(id, {
                status: newStatus,
                rejection_reason: reason
            });
            loadApplications(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleStatusBadgeClick = (app) => {
        if (app.status === 'REJECTED' && app.rejection_reason) {
            setViewReasonModal(app);
        }
    };

    const initiateRejection = (app) => {
        setSelectedAppForReject(app);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmRejection = async () => {
        if (!selectedAppForReject) return;

        await updateStatus(selectedAppForReject.id, 'REJECTED', rejectReason);
        setShowRejectModal(false);
        setSelectedAppForReject(null);
        setRejectReason('');
    };

    return (
        <div className="min-h-screen bg-[#FDFCFF] p-6 md:p-8 font-sans text-foreground pb-20">
            {/* View Rejection Reason Modal */}
            {viewReasonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all scale-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Rejection Reason</h3>
                                <p className="text-sm text-gray-500 mt-1">For {viewReasonModal.candidate_details.name}</p>
                            </div>
                            <button onClick={() => setViewReasonModal(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
                            {viewReasonModal.rejection_reason}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setViewReasonModal(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enter Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Candidate</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting <strong>{selectedAppForReject?.candidate_details.name}</strong>.
                        </p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none min-h-[100px]"
                            placeholder="e.g., Lack of relevant experience..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRejection}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* ... existing header code ... */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-normal text-gray-900 tracking-tight">
                            {jobDetails ? `Candidates: ${jobDetails.title}` : 'Candidate Management'}
                        </h1>
                    </div>

                    {/* Google-Style Search Toolbar */}
                    <div className="w-full md:w-[600px] bg-[#F0F2F5] rounded-full h-12 flex items-center px-4 transition-shadow focus-within:shadow-md border border-transparent focus-within:bg-white focus-within:border-gray-200">
                        {/* Search Icon */}
                        <div className="text-gray-500 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>

                        <input
                            type="text"
                            placeholder="Search candidates..."
                            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-500 text-sm"
                            value={searchQuery}
                            onChange={handleSearch}
                        />

                        {/* Filter Dropdown (Embedded) */}
                        <div className="relative border-l border-gray-300 pl-4 ml-2">
                            <select
                                value={currentStatus}
                                onChange={handleStatusChange}
                                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer pr-6 hover:text-gray-900"
                            >
                                <option value="">All Status</option>
                                <option value="NEW">New</option>
                                <option value="SCREENED">Screened</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="OFFER">Offer</option>
                                <option value="HIRED">Hired</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Material Design 3 Table Card */}
                <div className="bg-white border border-[#E0E3E7] rounded-[20px] overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading applications...</p>
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl text-gray-300">∅</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-[300px]">Candidate</th>
                                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApps.map((app) => (
                                        <tr key={app.id} className="h-16 border-b border-gray-50 hover:bg-[#F8F9FA] transition-colors group cursor-default">
                                            {/* Candidate Column */}
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                        {app.candidate_details.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Link to={`/admin/jobs/${app.job}`} className="text-sm font-bold text-gray-900 group-hover:text-[#1A73E8] transition-colors hover:underline">
                                                            {app.candidate_details.name}
                                                        </Link>
                                                        <div className="text-xs text-gray-500 font-normal">
                                                            {app.candidate_details.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Skills Column - Outlined Chips */}
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {(app.candidate_details.skills || []).slice(0, 2).map((skill, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg border border-gray-300 bg-white text-xs text-gray-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {(app.candidate_details.skills || []).length > 2 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-xs font-medium text-gray-500">
                                                            +{app.candidate_details.skills.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Job Role */}
                                            <td className="px-6 py-2">
                                                <span className="text-sm font-medium text-gray-700">{app.job_title}</span>
                                            </td>

                                            {/* Status Badge - Button Style with Stroke */}
                                            <td className="px-6 py-2">
                                                <div
                                                    onClick={() => handleStatusBadgeClick(app)}
                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 shadow-sm bg-white text-sm font-medium text-gray-700 ${app.status === 'REJECTED' && app.rejection_reason ? 'cursor-pointer hover:bg-red-50 hover:border-red-200' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${app.status === 'NEW' ? 'bg-blue-500' :
                                                        app.status === 'INTERVIEW' ? 'bg-purple-500' :
                                                            app.status === 'OFFER' ? 'bg-green-500' :
                                                                app.status === 'HIRED' ? 'bg-green-700' :
                                                                    app.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`} />
                                                    {app.status}
                                                    {app.status === 'REJECTED' && app.rejection_reason && (
                                                        <svg className="w-3 h-3 text-red-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions - Three Dot Menu (Simplification for now just to show ability to reject) */}
                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {app.status !== 'REJECTED' && (
                                                        <button
                                                            onClick={() => initiateRejection(app)}
                                                            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => window.location.href = `/admin/jobs/${app.job}`}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Simple Pagination */}
                    <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                        <span className="text-xs text-gray-500 font-medium">Showing {filteredApps.length} candidates</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadApplications(prevPage)}
                                disabled={!prevPage}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadApplications(nextPage)}
                                disabled={!nextPage}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ApplicationsPage;
