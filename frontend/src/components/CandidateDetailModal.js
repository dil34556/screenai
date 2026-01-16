import React from 'react';
import { X, Mail, Phone, Briefcase, DollarSign, Calendar, AlertCircle, Check, Clock } from 'lucide-react';

const CandidateDetailModal = ({ isOpen, onClose, candidate }) => {
    if (!isOpen || !candidate) return null;

    const details = candidate.candidate_details || {};
    const isRejected = candidate.status === 'REJECTED';

    // Status Logic
    const steps = [
        { id: 'NEW', label: 'New' },
        { id: 'SCREENED', label: 'Screened' },
        { id: 'INTERVIEW', label: 'Interview' },
        { id: 'OFFER', label: 'Offer' },
        { id: 'HIRED', label: 'Hired' }
    ];

    const getStepStatus = (stepId) => {
        if (isRejected) {
            // If rejected at this specific step
            if (candidate.rejected_stage === stepId) return 'rejected';

            // Check order
            const statusOrder = ['NEW', 'SCREENED', 'INTERVIEW', 'OFFER', 'HIRED'];
            const stepIndex = statusOrder.indexOf(stepId);
            const rejectedIndex = statusOrder.indexOf(candidate.rejected_stage);

            if (stepIndex < rejectedIndex) return 'completed';
            return 'pending';
        }

        const statusOrder = ['NEW', 'SCREENED', 'INTERVIEW', 'OFFER', 'HIRED'];
        const currentIndex = statusOrder.indexOf(candidate.status);
        const stepIndex = statusOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="relative bg-gray-50 p-6 border-b border-gray-100 rounded-t-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-200">
                            {details.name ? details.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{details.name}</h2>
                            <p className="text-gray-500 font-medium">{candidate.job_title || 'Unknown Role'}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">

                    {/* Status Pipeline Visual (Mini) */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pipeline Status</h3>
                        <div className="flex items-center justify-between relative">
                            {/* Line behind */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>

                            {steps.map((step, idx) => {
                                const status = getStepStatus(step.id);
                                let circleClass = "bg-white border-2 border-gray-200 text-gray-300";
                                let icon = <span className="text-[10px] font-bold">{idx + 1}</span>;

                                if (status === 'rejected') {
                                    circleClass = "bg-red-50 border-red-500 text-red-500 shadow-md";
                                    icon = <X size={12} strokeWidth={3} />;
                                } else if (status === 'completed') {
                                    circleClass = "bg-green-500 border-green-500 text-white shadow-md";
                                    icon = <Check size={12} strokeWidth={3} />;
                                } else if (status === 'current') {
                                    circleClass = "bg-indigo-600 border-indigo-600 text-white shadow-md";
                                    icon = <Clock size={12} strokeWidth={3} />;
                                }

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-1 z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                                            {icon}
                                        </div>
                                        <span className={`text-[10px] font-medium ${status === 'rejected' ? 'text-red-500' : status === 'current' ? 'text-indigo-600' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rejection Alert */}
                        {isRejected && (
                            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-red-700">Application Rejected</h4>
                                    <p className="text-sm text-red-600 mt-1">
                                        Stage: <span className="font-semibold">{candidate.rejected_stage || 'Unknown'}</span>
                                    </p>
                                    {candidate.rejection_reason && (
                                        <p className="text-sm text-red-600 mt-1 opacity-90">
                                            "{candidate.rejection_reason}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Email</p>
                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{details.email}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Phone</p>
                                <p className="text-sm font-semibold text-gray-900">{details.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Experience</p>
                                <p className="text-sm font-semibold text-gray-900">{candidate.experience_years ? `${candidate.experience_years} Years` : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Notice Period</p>
                                <p className="text-sm font-semibold text-gray-900">{candidate.notice_period ? `${candidate.notice_period} Days` : 'Immediate'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Resume Snapshot */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {details.skills && details.skills.length > 0 ? (
                                details.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No skills listed</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                    >
                        Close Details
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CandidateDetailModal;
