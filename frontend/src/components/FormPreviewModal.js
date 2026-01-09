import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const FormPreviewModal = ({ job, onClose }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/[0.08] shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Decorational Gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.08] relative z-10 shrink-0">
                    <h2 className="text-xl font-heading font-light text-white">Form Preview</h2>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar relative z-10">
                    {/* Job Info */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5 shadow-glow">
                            <div className="text-2xl">💼</div>
                        </div>
                        <h1 className="text-3xl font-heading font-light text-white mb-3">{job.title}</h1>
                        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold uppercase tracking-wider text-white/40">
                            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{job.department}</span>
                            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{job.location}</span>
                            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{job.job_type}</span>
                        </div>
                    </div>

                    {/* Standard Fields */}
                    <div className="space-y-8 mb-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Personal Information</h3>
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Name <span className="text-rose-400">*</span></label>
                                <div className="h-12 border border-white/[0.08] rounded-2xl bg-white/[0.02]"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Email <span className="text-rose-400">*</span></label>
                                <div className="h-12 border border-white/[0.08] rounded-2xl bg-white/[0.02]"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Phone <span className="text-rose-400">*</span></label>
                                <div className="h-12 border border-white/[0.08] rounded-2xl bg-white/[0.02]"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Resume <span className="text-rose-400">*</span></label>
                                <div className="h-12 border border-dashed border-white/20 rounded-2xl bg-white/[0.02] flex items-center px-4 text-white/30 text-sm">
                                    Upload PDF/DOC...
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6 mt-10">
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Profile Details</h3>
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Current CTC</label>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500/50 w-1/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Notice Period</label>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500/50 w-1/4 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Screening Questions</h3>
                            <div className="h-px bg-white/[0.08] flex-1"></div>
                        </div>

                        {job.screening_questions && job.screening_questions.length > 0 ? (
                            job.screening_questions.map((q, index) => (
                                <div key={index} className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <label className="block text-sm font-medium text-white/90">
                                            <span className="text-white/40 mr-2">{index + 1}.</span> {q.question} {q.required && <span className="text-rose-400">*</span>}
                                        </label>
                                    </div>
                                    <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-4">
                                        {q.type} {q.options && `• ${q.options.join(', ')}`}
                                    </div>

                                    {/* Mock Input Preview */}
                                    <div className="pointer-events-none opacity-50">
                                        {q.type === 'short_text' && <div className="h-12 border border-white/[0.08] rounded-xl bg-black/20"></div>}
                                        {q.type === 'long_text' && <div className="h-24 border border-white/[0.08] rounded-xl bg-black/20"></div>}
                                        {q.type === 'single_select' && (
                                            <div className="h-12 border border-white/[0.08] rounded-xl bg-black/20 flex items-center px-4 text-white/20">Select...</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-white/30 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                                No custom screening questions configured.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/20 border-t border-white/[0.08] flex gap-4 shrink-0 relative z-10 backdrop-blur-sm">
                    <button
                        onClick={() => window.open(`/jobs/${job.id}/apply`, '_blank')}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-full font-bold hover:shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 text-sm tracking-wide"
                    >
                        <ExternalLink size={18} />
                        View Live Application Form
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPreviewModal;
