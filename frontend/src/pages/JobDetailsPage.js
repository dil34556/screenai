import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobDetail, getApplicationsForJob, updateApplicationStatus, addComment, reparseApplication } from '../services/api';
import {
    Search, Filter, ChevronDown,
    Linkedin, FileText, ArrowLeft,
    Briefcase, MapPin, Users, MessageSquare, Eye, SlidersHorizontal, Download, Wand2, X
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
    const [questionFilters, setQuestionFilters] = useState({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [selectedApp, setSelectedApp] = useState(null);
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [docxContent, setDocxContent] = useState("");

    const fetchData = async () => {
        try {
            const [jobData, appsData] = await Promise.all([
                getJobDetail(jobId),
                getApplicationsForJob(jobId)
            ]);
            setJob(jobData);
            setApplications(appsData.results || appsData);
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
                    setDocxContent(`Failed to load preview. Please download the file.`);
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
            setNewComment("");
            setShowCommentsModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to add comment", err);
            alert("Failed to add comment");
        }
    };

    const handleReparse = async (app) => {
        if (!window.confirm(`Reparse resume for ${app.candidate_details.name}?`)) return;
        try {
            await reparseApplication(app.id);
            alert("Resume parsed successfully!");
            fetchData();
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message;
            alert(`Parsing failed: ${errorMessage}`);
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

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!job) return <div className="p-8 text-center text-slate-500">Job not found</div>;

    const filteredApps = applications.filter(app => {
        const matchSearch = app.candidate_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.candidate_details.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === 'All Status' || app.status === filterStatus;

        const appPlatform = app.platform || 'Other';
        const matchPlatform = filterPlatform === 'All Platforms' ||
            (filterPlatform === 'Other' ? appPlatform === 'Other' : appPlatform.toLowerCase() === filterPlatform.toLowerCase());

        let matchQuestions = true;
        Object.keys(questionFilters).forEach(qText => {
            const filterVal = questionFilters[qText].toLowerCase();
            if (filterVal) {
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
        if (p.includes('linkedin')) return <Linkedin size={14} className="text-[#0077b5]" />;
        if (p.includes('indeed')) return <span className="text-[#2164f3] font-bold text-[10px]">IN</span>;
        if (p.includes('glassdoor')) return <span className="text-[#0caa41] font-bold text-[10px]">GL</span>;
        if (p.includes('naukri')) return <span className="text-[#fbd235] font-bold text-[10px] text-black">NK</span>;
        return <Briefcase size={14} className="text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Header Background */}
            <div className="bg-white border-b border-indigo-50 px-6 py-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <Link to="/admin/jobs" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-600 mb-6 transition-colors group">
                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to jobs
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {job.status || 'Active'}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-indigo-400" /> {job.department}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-indigo-400" /> {job.location} ({job.job_type})</span>
                                <span className="flex items-center gap-1.5"><Users size={16} className="text-indigo-400" /> {applications.length} Candidates</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Placeholder for future actions like "Edit Job" */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                {/* Filters Bar */}
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/50 mb-8 supports-[backdrop-filter]:bg-white/60">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-5">

                        {/* Search */}
                        <div className="relative w-full xl:max-w-md group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters Group */}
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
                            {/* Status */}
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white font-medium text-sm text-slate-700 border-2 border-slate-100 hover:border-indigo-200 rounded-xl px-4 py-3 pr-10 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            {/* Platform */}
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white font-medium text-sm text-slate-700 border-2 border-slate-100 hover:border-indigo-200 rounded-xl px-4 py-3 pr-10 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'}`}
                            >
                                <SlidersHorizontal size={18} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="mt-5 pt-5 border-t border-slate-100 grid md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                            {job.screening_questions && job.screening_questions.map((q, i) => (
                                <div key={i}>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 truncate" title={q.question}>{q.question}</label>
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                        value={questionFilters[q.question] || ''}
                                        onChange={(e) => setQuestionFilters(prev => ({ ...prev, [q.question]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                                    <th className="px-6 py-5">Candidate</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-center">Exp</th>
                                    <th className="px-6 py-5">CTC Stats</th>
                                    <th className="px-6 py-5">Work History</th>
                                    <th className="px-6 py-5 min-w-[200px]">Skills</th>
                                    {job.screening_questions && job.screening_questions.map((q, i) => (
                                        <th key={i} className="px-6 py-5 min-w-[150px] truncate max-w-[200px]" title={q.question}>
                                            {q.question}
                                        </th>
                                    ))}
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredApps.map((app) => (
                                    <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center font-bold text-lg mr-4 border border-white/20">
                                                    {app.candidate_details.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{app.candidate_details.name}</div>
                                                    <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                                                        <span>{app.candidate_details.email}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>{app.candidate_details.phone}</span>
                                                    </div>
                                                    <div className="mt-1.5 flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                                                            {getPlatformIcon(app.platform)} {app.platform || 'Other'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(app.applied_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="relative inline-block group/status">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all shadow-sm ${app.status === 'NEW' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                                                        app.status === 'SCREENED' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' :
                                                            app.status === 'INTERVIEW' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200' :
                                                                app.status === 'OFFER' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' :
                                                                    'bg-red-50 text-red-700 ring-1 ring-red-200'
                                                        }`}
                                                >
                                                    <option value="NEW">New</option>
                                                    <option value="SCREENED">Screened</option>
                                                    <option value="INTERVIEW">Interview</option>
                                                    <option value="OFFER">Offer</option>
                                                    <option value="REJECTED">Rejected</option>
                                                </select>
                                                <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50`} />
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block font-bold px-2 py-1 rounded text-xs ${app.total_years_experience || app.experience_years ? 'text-slate-700 bg-slate-100' : 'text-slate-300'}`}>
                                                {app.total_years_experience || app.experience_years || '-'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between w-24 text-xs">
                                                    <span className="text-slate-400">Cur:</span>
                                                    <span className="font-semibold text-slate-700">{app.current_ctc ? `${app.current_ctc}L` : '-'}</span>
                                                </div>
                                                <div className="flex justify-between w-24 text-xs">
                                                    <span className="text-slate-400">Exp:</span>
                                                    <span className="font-bold text-indigo-600">{app.expected_ctc ? `${app.expected_ctc}L` : '-'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 max-w-[180px]">
                                                {app.work_experience && app.work_experience.length > 0 ? (
                                                    app.work_experience.slice(0, 2).map((exp, idx) => (
                                                        <div key={idx} className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-800 truncate" title={exp.company_name}>{exp.company_name}</span>
                                                            <span className="text-[10px] text-slate-500 truncate" title={exp.job_role}>{exp.job_role}</span>
                                                        </div>
                                                    ))
                                                ) : <span className="text-slate-300 text-xs">-</span>}
                                                {app.work_experience && app.work_experience.length > 2 && (
                                                    <span className="text-[10px] text-indigo-500 font-medium">+ {app.work_experience.length - 2} more</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.skills && app.skills.length > 0 ? (
                                                    [...app.skills].sort().map((skill, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default whitespace-nowrap">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : <span className="text-slate-300 text-xs">-</span>}
                                            </div>
                                        </td>

                                        {/* Answers */}
                                        {job.screening_questions && job.screening_questions.map((q, i) => {
                                            const ansObj = app.answers?.find(a => a.question === q.question);
                                            return (
                                                <td key={i} className="px-6 py-4">
                                                    <div className="text-xs text-slate-600 max-w-[180px] truncate font-medium" title={ansObj ? ansObj.answer : ''}>
                                                        {ansObj ? ansObj.answer : '-'}
                                                    </div>
                                                </td>
                                            );
                                        })}

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => handleViewResume(app)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="View Resume"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedApp(app); setShowAnswersModal(true); }}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedApp(app);
                                                        const existingComment = app.comments && app.comments.length > 0 ? app.comments[0].text : "";
                                                        setNewComment(existingComment);
                                                        setShowCommentsModal(true);
                                                    }}
                                                    className={`p-2 rounded-lg transition-all ${app.comments && app.comments.length > 0 ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                                    title="Notes"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleReparse(app)}
                                                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                    title="Reparse Resume"
                                                >
                                                    <Wand2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredApps.length === 0 && (
                                    <tr>
                                        <td colSpan="100%" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Search size={24} className="opacity-50" />
                                                </div>
                                                <p className="text-lg font-medium text-slate-600">No candidates found</p>
                                                <p className="text-sm">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Answers Modal */}
            {showAnswersModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAnswersModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedApp.candidate_details.name}</h3>
                                <p className="text-sm text-gray-500">Application Details</p>
                            </div>
                            <button onClick={() => setShowAnswersModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Screening Questions</h4>
                                {Array.isArray(selectedApp.answers) && selectedApp.answers.length > 0 ? (
                                    <div className="grid gap-4">
                                        {selectedApp.answers.map((ans, idx) => (
                                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-indigo-600 mb-1.5">{ans.question || `Question ${idx + 1}`}</p>
                                                <p className="text-sm text-slate-800 font-medium leading-relaxed">{ans.answer || ans.response || '-'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic bg-gray-50 p-4 rounded-lg text-center">No screening questions were answered.</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recruiter Notes</h4>
                                    <button
                                        onClick={() => {
                                            const existingComment = selectedApp.comments && selectedApp.comments.length > 0 ? selectedApp.comments[0].text : "";
                                            setNewComment(existingComment);
                                            setShowAnswersModal(false);
                                            setShowCommentsModal(true);
                                        }}
                                        className="text-xs flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors"
                                    >
                                        <MessageSquare size={12} /> Edit Note
                                    </button>
                                </div>
                                {Array.isArray(selectedApp.comments) && selectedApp.comments.length > 0 ? (
                                    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 rounded-l-xl"></div>
                                        <p className="text-sm text-yellow-900 whitespace-pre-wrap font-medium">{selectedApp.comments[0].text}</p>
                                        <p className="text-[10px] text-yellow-600/60 mt-3 text-right font-medium">
                                            Last updated: {new Date(selectedApp.comments[0].created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic bg-gray-50 p-4 rounded-lg text-center">No notes added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {showCommentsModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCommentsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Notes for {selectedApp.candidate_details.name}</h3>
                            <button onClick={() => setShowCommentsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6">
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none"
                                placeholder="Write your internal notes here..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                autoFocus
                            ></textarea>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setShowCommentsModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button
                                    onClick={handleAddComment}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200" onClick={() => setShowResumeModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full h-[90vh] max-w-6xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
                                    {selectedApp.candidate_details.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedApp.candidate_details.name}</h3>
                                    <p className="text-xs text-slate-500">Resume Preview</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a href={selectedApp.resume} download className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                    <Download size={16} /> Download
                                </a>
                                <button onClick={() => setShowResumeModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 p-6 overflow-hidden relative">
                            {selectedApp.resume.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={selectedApp.resume}
                                    className="w-full h-full rounded-xl shadow-lg border border-slate-200 bg-white"
                                    title="Resume Viewer"
                                />
                            ) : selectedApp.resume.toLowerCase().endsWith('.docx') ? (
                                <div className="w-full h-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 overflow-auto prose prose-sm max-w-none mx-auto">
                                    {docxContent === "Loading preview..." ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p>Rendering DOCX preview...</p>
                                        </div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: docxContent }} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <FileText size={48} className="text-indigo-200" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-700 mb-2">Preview Unavailable</p>
                                        <p className="text-sm max-w-xs mx-auto">We can't render this file type directly in the browser. Please download it to view.</p>
                                    </div>
                                    <a href={selectedApp.resume} download className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
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
