import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const FormPreviewModal = ({ job, onClose }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Form Preview</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto bg-gray-50/50">
                    {/* Job Info */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 font-medium">
                            <span>{job.department}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.job_type}</span>
                        </div>
                    </div>

                    {/* Standard Fields */}
                    <div className="space-y-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <div className="h-10 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <div className="h-10 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                                <div className="h-10 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume <span className="text-red-500">*</span></label>
                                <div className="h-10 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center px-3 text-gray-400 text-sm">Upload PDF/DOC</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Professional Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current CTC</label>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-200 w-1/3"></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected CTC</label>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-200 w-1/2"></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-200 w-1/4"></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Experience</label>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-200 w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Application Questions</h3>
                        </div>

                        {job.screening_questions && job.screening_questions.length > 0 ? (
                            job.screening_questions.map((q, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <label className="block text-sm font-medium text-gray-900">
                                            {index + 1}. {q.question} {q.required && <span className="text-red-500">*</span>}
                                        </label>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Type: {q.type} {q.options && `| Options: ${q.options.join(', ')}`}
                                    </div>

                                    {/* Mock Input Preview */}
                                    <div className="mt-3 pointer-events-none opacity-50">
                                        {q.type === 'short_text' && <div className="h-10 border border-gray-200 rounded-lg bg-gray-50"></div>}
                                        {q.type === 'long_text' && <div className="h-20 border border-gray-200 rounded-lg bg-gray-50"></div>}
                                        {q.type === 'single_select' && (
                                            <div className="h-10 border border-gray-200 rounded-lg bg-gray-50 flex items-center px-3 text-gray-400">Select...</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No custom screening questions configured.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100 flex gap-4">
                    <button
                        onClick={() => window.open(`/jobs/${job.id}/apply`, '_blank')}
                        className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        <ExternalLink size={18} />
                        Open Full Form
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPreviewModal;
