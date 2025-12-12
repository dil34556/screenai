
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobDetail, getApplicationsForJob, updateApplicationStatus, addComment } from '../services/api';
import {
    Search, Filter, ChevronDown,
    Linkedin, FileText, ArrowLeft,
    Briefcase, MapPin, Users, MessageSquare, Eye, SlidersHorizontal, Download
} from 'lucide-react';
import mammoth from 'mammoth';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterPlatform, setFilterPlatform] = useState('All Platforms');
    // Removed single filterQuestion state
    const [questionFilters, setQuestionFilters] = useState({}); // New object based filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle for filter panel
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [selectedApp, setSelectedApp] = useState(null); // For modals
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [docxContent, setDocxContent] = useState(""); // State for rendered docx HTML

    const fetchData = async () => {
        try {
            const [jobData, appsData] = await Promise.all([
                getJobDetail(jobId),
                getApplicationsForJob(jobId)
            ]);
            setJob(jobData);
            setApplications(appsData);
        } catch (err) {
            console.error("Failed to fetch job details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    // Handle DOCX Rendering when modal opens
    useEffect(() => {
        if (showResumeModal && selectedApp && selectedApp.resume.toLowerCase().endsWith('.docx')) {
            setDocxContent("Loading preview...");
            fetch(selectedApp.resume)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
                .then(result => {
                    setDocxContent(result.value);
                })
                .catch(err => {
                    console.error("Mammoth error:", err);
                    setDocxContent(`Failed to load preview.Please download the file.`);
                });
        } else {
            setDocxContent("");
        }
    }, [showResumeModal, selectedApp]);


    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await updateApplicationStatus(appId, newStatus);
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
    };

    const handleAddComment = async () => {
        if (!selectedApp || !newComment.trim()) return;
        try {
            await addComment(selectedApp.id, newComment);
            alert("Comment added!"); // Ideally refresh data or append to local state
            setNewComment("");
            setShowCommentsModal(false);
            fetchData(); // Refresh to get updated counts/comments if we fetched them
        } catch (err) {
            console.error("Failed to add comment", err);
            alert("Failed to add comment");
        }
    };

    const handleViewResume = (app) => {
        if (!app.resume) {
            alert("No resume uploaded found.");
            return;
        }
        setSelectedApp(app);
        setShowResumeModal(true);
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-indigo-600">Loading...</div>;
    if (!job) return <div className="p-8 text-center">Job not found</div>;

    const filteredApps = applications.filter(app => {
        // 1. Basic Search (Name/Email)
        const matchSearch = app.candidate_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.candidate_details.email.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Status Filter
        const matchStatus = filterStatus === 'All Status' || app.status === filterStatus;

        // 3. Platform Filter
        const appPlatform = app.platform || 'Other';
        const matchPlatform = filterPlatform === 'All Platforms' ||
            (filterPlatform === 'Other' ? appPlatform === 'Other' : appPlatform.toLowerCase() === filterPlatform.toLowerCase());

        // 4. Object-based Question Filter (Panel)
        // Check ALL active filters in questionFilters
        let matchQuestions = true;
        Object.keys(questionFilters).forEach(qText => {
            const filterVal = questionFilters[qText].toLowerCase();
            if (filterVal) {
                // Find the answer for this question
                const answerObj = app.answers?.find(a => a.question === qText);
                if (!answerObj || !String(answerObj.answer).toLowerCase().includes(filterVal)) {
                    matchQuestions = false;
                }
            }
        });

        return matchSearch && matchStatus && matchPlatform && matchQuestions;
    });

    const getPlatformIcon = (platform) => {
        const p = platform ? platform.toLowerCase() : 'other';
        if (p.includes('linkedin')) return <Linkedin size={16} className="text-[#0077b5]" />;
        if (p.includes('indeed')) return <span className="text-[#2164f3] font-bold text-xs">In</span>;
        if (p.includes('glassdoor')) return <span className="text-[#0caa41] font-bold text-xs">Gl</span>;
        if (p.includes('naukri')) return <span className="text-[#fbd235] font-bold text-xs text-black">Nk</span>;
        return <Briefcase size={16} className="text-gray-400" />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans text-slate-800 relative">
            {/* Header */}
            <div className="mb-8">
                <Link to="/admin/jobs" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to jobs
                </Link>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{job.title}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location} ({job.job_type})</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Users size={14} /> {applications.length} candidates</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4">

                {/* Top Row: Search + Main Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                    {/* Search */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search candidates by name or email..."
                            className="input-premium pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters & Toggles */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                        <div className="relative">
                            <select
                                className="input-premium appearance-none cursor-pointer pr-10"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option>All Status</option>
                                <option value="NEW">New</option>
                                <option value="SCREENED">Screened</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="OFFER">Offer</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>

                        <div className="relative">
                            <select
                                className="input-premium appearance-none cursor-pointer pr-10"
                                value={filterPlatform}
                                onChange={(e) => setFilterPlatform(e.target.value)}
                            >
                                <option>All Platforms</option>
                                <option value="LINKEDIN">LinkedIn</option>
                                <option value="INDEED">Indeed</option>
                                <option value="GLASSDOOR">Glassdoor</option>
                                <option value="NAUKRI">Naukri</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>

                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:border-indigo-300'}`}
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel (Collapsible) */}
                {showAdvancedFilters && (
                    <div className="w-full pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {job.screening_questions && job.screening_questions.map((q, i) => (
                            <div key={i}>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 truncate">{q.question}</label>
                                <input
                                    type="text"
                                    placeholder={`Filter by ${q.question.substring(0, 10)}...`}
                                    className="input-premium py-2"
                                    value={questionFilters[q.question] || ''}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, [q.question]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Candidate Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4">Applied</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Experience</th>
                                <th className="px-6 py-4">CTC (Cur / Exp)</th>

                                {/* Dynamic Question Headers */}
                                {job.screening_questions && job.screening_questions.map((q, i) => (
                                    <th key={i} className="px-6 py-4 min-w-[150px]">
                                        {q.question.length > 30 ? q.question.substring(0, 30) + '...' : q.question}
                                    </th>
                                ))}

                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                {app.candidate_details.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{app.candidate_details.name}</div>
                                                <div className="text-gray-500 text-xs">{app.candidate_details.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            {app.candidate_details.phone || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-600">
                                            {getPlatformIcon(app.platform)}
                                            {app.platform || 'Other'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{new Date(app.applied_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                className={`appearance-none pl-3 pr-8 py-1 text-xs font-bold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition shadow-sm ${app.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                    app.status === 'SCREENED' ? 'bg-indigo-100 text-indigo-700' :
                                                        app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' :
                                                            app.status === 'OFFER' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                <option value="NEW">New</option>
                                                <option value="SCREENED">Screened</option>
                                                <option value="INTERVIEW">Interview</option>
                                                <option value="OFFER">Offer</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {app.experience_years ? `${app.experience_years} Yrs` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600">
                                            <div>{app.current_ctc ? `${app.current_ctc} L` : '-'} / </div>
                                            <div className="font-semibold">{app.expected_ctc ? `${app.expected_ctc} L` : '-'}</div>
                                        </div>
                                    </td>

                                    {/* Dynamic Answer Cells */}
                                    {job.screening_questions && job.screening_questions.map((q, i) => {
                                        const ansObj = app.answers?.find(a => a.question === q.question);
                                        return (
                                            <td key={i} className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate" title={ansObj ? ansObj.answer : ''}>
                                                    {ansObj ? ansObj.answer : '-'}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewResume(app)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="View Resume"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedApp(app); setShowAnswersModal(true); }}
                                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                title="View Answers"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    // Pre-fill existing comment if any
                                                    const existingComment = app.comments && app.comments.length > 0 ? app.comments[0].text : "";
                                                    setNewComment(existingComment);
                                                    setShowCommentsModal(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                title="Recruiter Note"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Answers Modal */}
            {showAnswersModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAnswersModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
                            <button onClick={() => setShowAnswersModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6">
                            {/* Answers Section */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Screening Answers</h4>
                                {Array.isArray(selectedApp.answers) && selectedApp.answers.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedApp.answers.map((ans, idx) => (
                                            <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">{ans.question || `Question ${idx + 1}`}</p>
                                                <p className="text-sm text-gray-800">{ans.answer || ans.response || '-'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No custom answers recorded.</p>
                                )}
                            </div>

                            {/* Comments Section (Single Note) */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare size={14} /> Recruiter Note
                                    </h4>
                                    <button
                                        onClick={() => {
                                            // Switch to Edit Mode
                                            const existingComment = selectedApp.comments && selectedApp.comments.length > 0 ? selectedApp.comments[0].text : "";
                                            setNewComment(existingComment);
                                            setShowAnswersModal(false);
                                            setShowCommentsModal(true);
                                        }}
                                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Edit Note
                                    </button>
                                </div>
                                {Array.isArray(selectedApp.comments) && selectedApp.comments.length > 0 ? (
                                    <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedApp.comments[0].text}</p>
                                        <p className="text-xs text-indigo-400 mt-2 text-right">
                                            Last updated: {new Date(selectedApp.comments[0].created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No note added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Modal (Now "Notes") */}
            {showCommentsModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCommentsModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Recruiter Note for {selectedApp.candidate_details.name}</h3>
                            <button onClick={() => setShowCommentsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">Add or update the note for this candidate. Only one note is stored.</p>
                            <textarea
                                className="input-premium min-h-[120px]"
                                rows="5"
                                placeholder="Write a note..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAddComment}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Modal */}
            {showResumeModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowResumeModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full h-[90vh] max-w-5xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Resume: {selectedApp.candidate_details.name}</h3>
                            <div className="flex gap-2">
                                <a href={selectedApp.resume} download className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                                    <Download size={14} /> Download
                                </a>
                                <button onClick={() => setShowResumeModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
                            {selectedApp.resume.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={selectedApp.resume}
                                    className="w-full h-full rounded shadow-sm bg-white"
                                    title="Resume Viewer"
                                />
                            ) : selectedApp.resume.toLowerCase().endsWith('.docx') ? (
                                <div className="w-full h-full bg-white rounded shadow-sm p-8 overflow-auto prose max-w-none">
                                    {docxContent === "Loading preview..." ? (
                                        <div className="flex items-center justify-center h-full text-gray-500">Loading preview...</div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: docxContent }} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                    <FileText size={48} className="text-gray-300" />
                                    <p>Preview not available for this file type.</p>
                                    <a href={selectedApp.resume} download className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JobDetailsPage;
