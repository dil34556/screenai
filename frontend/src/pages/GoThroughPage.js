import React, { useState, useEffect } from 'react';
import { getApplications } from '../services/api';
import { Check, Clock, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoThroughPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await getApplications();
            // Handle pagination if data.results exists, else assume array
            const results = Array.isArray(data) ? data : data.results || [];
            console.log("Fetched applications:", results);
            setApplications(results);
        } catch (err) {
            console.error("Failed to load applications", err);
            setError("Failed to load pipeline data.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 'NEW', label: 'New' },
        { id: 'SCREENED', label: 'Screened' },
        { id: 'INTERVIEW', label: 'Interview' },
        { id: 'OFFER', label: 'Offer' },
        { id: 'HIRED', label: 'Hired' }
    ];

    const getStepStatus = (stepId, currentStatus) => {
        // If rejected, special handling
        if (currentStatus === 'REJECTED') {
            return 'rejected_view';
        }

        const statusOrder = ['NEW', 'SCREENED', 'INTERVIEW', 'OFFER', 'HIRED'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepId);

        if (currentIndex === -1) return 'pending';

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    if (error) {
        return (
            <div className="h-full p-10 flex items-center justify-center">
                <div className="text-red-500 bg-red-50 p-6 rounded-xl border border-red-100">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchApplications} className="mt-4 text-sm underline">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#FDFCFF] p-6 md:p-10 font-sans text-foreground pb-20 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-10">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>Portal</span>
                        <span>›</span>
                        <span className="text-gray-900 font-medium">Go-Through</span>
                    </div>
                    <h1 className="text-4xl font-normal text-[#1F1F1F] tracking-tight">
                        Pipeline Journey
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-light">Track each candidate's progress through the hiring rounds.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 animate-pulse">Loading journey map...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-200">
                                            {app.candidate_details?.name ? app.candidate_details.name.charAt(0).toUpperCase() : 'C'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                                {app.candidate_details?.name || 'Unknown Candidate'}
                                            </h3>
                                            <div className="text-base text-gray-500 flex flex-wrap items-center gap-2">
                                                <span>Applied for</span>
                                                {/* Fallback if job is missing */}
                                                {app.job ? (
                                                    <Link to={`/admin/jobs/${app.job}`} className="font-medium text-indigo-600 hover:underline">
                                                        {app.job_title || 'View Job'}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium text-gray-400">Unknown Job</span>
                                                )}
                                                <span className="text-gray-300">•</span>
                                                <span>{new Date(app.applied_at || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            {app.email && <div className="text-sm text-gray-400 mt-1">{app.email}</div>}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {app.status === 'REJECTED' && (
                                        <div className="px-5 py-2.5 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-100 flex items-center gap-2 self-start">
                                            <AlertCircle size={18} />
                                            Rejected
                                        </div>
                                    )}
                                </div>

                                {/* Stepper / Root Map */}
                                <div className="relative px-2">
                                    {/* Connecting Line */}
                                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10 hidden md:block rounded-full"></div>

                                    <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0 relative">
                                        {steps.map((step, idx) => {
                                            let status = getStepStatus(step.id, app.status);

                                            // Visual Logic
                                            let circleClass = "bg-white border-2 border-gray-200 text-gray-300";
                                            let textClass = "text-gray-400 font-normal";
                                            let icon = <span className="text-xs font-semibold">{idx + 1}</span>;

                                            if (app.status === 'REJECTED') {
                                                circleClass = "bg-gray-50 border-gray-200 text-gray-300";
                                                textClass = "text-gray-300";
                                                icon = <span className="text-xs font-semibold">{idx + 1}</span>;
                                            } else if (status === 'completed') {
                                                circleClass = "bg-[#22C55E] border-[#22C55E] text-white shadow-lg shadow-green-200 scale-100";
                                                textClass = "text-[#22C55E] font-medium";
                                                icon = <Check size={16} strokeWidth={3} />;
                                            } else if (status === 'current') {
                                                circleClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110";
                                                textClass = "text-indigo-700 font-bold";
                                                icon = <Clock size={16} />;
                                            } else if (status === 'rejected_view') {
                                                circleClass = "bg-gray-50 border-gray-200 text-gray-300";
                                                textClass = "text-gray-400";
                                            }

                                            return (
                                                <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-4 bg-white md:bg-transparent p-2 md:p-0 rounded-lg">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${circleClass}`}>
                                                        {icon}
                                                    </div>
                                                    <span className={`text-sm ${textClass} transition-colors duration-300`}>{step.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {app.status === 'REJECTED' && app.rejection_reason && (
                                    <div className="mt-8 mx-auto bg-gray-50 rounded-xl border border-gray-200 p-5 w-full md:w-full">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={20} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-gray-700 block mb-1">Rejection Reason</span>
                                                <p className="text-gray-600 leading-relaxed text-sm">"{app.rejection_reason}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {applications.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 border-dashed">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Info size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                                <p className="text-gray-400 max-w-sm mx-auto mt-2">Candidates who apply will appear here in the pipeline journey.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoThroughPage;
