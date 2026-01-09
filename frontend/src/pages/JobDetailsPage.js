import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobDetail, getApplicationsForJob, updateApplicationStatus, updateApplication, reparseApplication, updateJob } from '../services/api';
import {
    Search, Filter, ChevronDown,
    Linkedin, FileText, ArrowLeft,
    Briefcase, MapPin, Users, MessageSquare, Eye, SlidersHorizontal, Download, Wand2, X, ExternalLink, Plus
} from 'lucide-react';
import mammoth from 'mammoth';
import Skeleton from '../components/Skeleton';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterPlatform, setFilterPlatform] = useState('All Platforms');
    const [filterSkill, setFilterSkill] = useState(''); // New State
    const [questionFilters, setQuestionFilters] = useState({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ... (rest of code) ...

    const filteredApps = (Array.isArray(applications) ? applications : []).filter(app => {
        const matchSearch = app.candidate_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.candidate_details.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === 'All Status' || app.status === filterStatus;

        const appPlatform = app.platform || 'Other';
        const matchPlatform = filterPlatform === 'All Platforms' ||
            (filterPlatform === 'Other' ? appPlatform === 'Other' : appPlatform.toLowerCase() === filterPlatform.toLowerCase());

        // Skill Filter Logic
        const matchSkill = !filterSkill || (app.skills && app.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())));

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

        return matchSearch && matchStatus && matchPlatform && matchSkill && matchQuestions;
    });

    // Valid Missing Modal States
    const [selectedApp, setSelectedApp] = useState(null);
    // Modal States - consolidated to use showAnswersModal as the main 'Detail View'
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [activeTab, setActiveTab] = useState('application'); // application, resume, notes
    const [newComment, setNewComment] = useState('');
    const [expandedSkillsAppId, setExpandedSkillsAppId] = useState(null); // Track which row expanded skills

    // Close expanded skills on outside click
    useEffect(() => {
        const handleClickOutside = () => setExpandedSkillsAppId(null);
        if (expandedSkillsAppId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [expandedSkillsAppId]);
    const [docxContent, setDocxContent] = useState('');
    const [showCustomPlatformModal, setShowCustomPlatformModal] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');
    const [savingPlatform, setSavingPlatform] = useState(false);

    const defaultPlatforms = ['linkedin', 'indeed', 'glassdoor', 'naukri'];
    const allQuestions = job?.screening_questions || [];

    useEffect(() => {
        if (jobId) fetchJobAndApps();
    }, [jobId]);

    const fetchJobAndApps = async () => {
        try {
            setLoading(true);
            const [jobData, appsData] = await Promise.all([
                getJobDetail(jobId),
                getApplicationsForJob(jobId)
            ]);
            setJob(jobData);
            setApplications(Array.isArray(appsData) ? appsData : (appsData.results || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await updateApplicationStatus(appId, newStatus);
            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleAddComment = async () => {
        if (!selectedApp) return; // Allow empty notes to clear them
        try {
            // Update the Application model directly with the 'notes' field
            // Note: We need to ensure updateApplication exists or use custom endpoint
            // Since we don't have updateApplication yet, we might need to add it to api.js
            // or use a generic update.
            // Let's assume we will add 'updateApplication' to api.js
            await updateApplication(selectedApp.id, { notes: newComment });

            setApplications(prev => prev.map(app =>
                app.id === selectedApp.id
                    ? { ...app, notes: newComment }
                    : app
            ));

            // Critical Fix: Update selectedApp so the UI reflects the change immediately
            setSelectedApp(prev => ({ ...prev, notes: newComment }));

            // Keep the new comment in the input field (don't clear it) to show what was saved
            // OR clear it if we rely on selectedApp.notes
            // setNewComment(''); // Don't clear, or set to null?
            // Actually, if we update selectedApp, the value prop `newComment || selectedApp.notes` works.
            // But if user keeps typing, newComment is used. 
            // Let's clear newComment so it falls back to the updated selectedApp.notes
            setNewComment('');

            // Optional: Show temporary success feedback?
            // For now, just the UI update is enough proof.
        } catch (err) {
            console.error("Failed to save note", err);
            alert("Failed to save note.");
        }
    };

    const handleViewResume = async (app) => {
        // setSelectedApp(app); // Already selected in modal
        // setShowResumeModal(true); // Removed
        if (app && app.resume && app.resume.toLowerCase().endsWith('.docx')) {
            setDocxContent("Loading preview...");
            try {
                const response = await fetch(app.resume);
                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setDocxContent(result.value);
            } catch (err) {
                setDocxContent('<p class="text-red-500">Failed to load DOCX preview.</p>');
            }
        }
    };

    const openApplyLink = (platform) => {
        const link = `${window.location.origin}/apply/${jobId}?platform=${platform}`;
        window.open(link, '_blank');
    };

    const [customPlatforms, setCustomPlatforms] = useState([]);

    const handleAddCustomPlatform = () => {
        if (newPlatformName.trim()) {
            setCustomPlatforms([...customPlatforms, newPlatformName.trim()]);
            setNewPlatformName('');
            setShowCustomPlatformModal(false);
        }
    };

    const getAllPlatforms = () => [];

    if (loading) return (
        <div className="min-h-screen bg-google-grey-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="sticky top-[89px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
                <div className="max-w-[1600px] mx-auto flex gap-4">
                    <Skeleton className="h-10 w-96 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="max-w-[1600px] mx-auto px-4 py-6">
                <div className="glass-panel overflow-hidden p-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="flex gap-6 items-center border-b border-gray-100 pb-4 last:border-0">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (!job) return <div className="flex items-center justify-center h-screen">Job not found</div>;

    const getPlatformIcon = (platform) => {
        const p = platform ? platform.toLowerCase() : 'other';
        if (p.includes('linkedin')) return <Linkedin size={14} className="text-[#0077b5]" />;
        if (p.includes('indeed')) return <span className="text-[#2164f3] font-bold text-[10px]">IN</span>;
        if (p.includes('glassdoor')) return <span className="text-[#0caa41] font-bold text-[10px]">GL</span>;
        if (p.includes('naukri')) return <span className="text-[#fbd235] font-bold text-[10px] text-black">NK</span>;
        return <Briefcase size={14} className="text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative pb-20 font-sans">
            {/* Custom Platform Modal */}
            {showCustomPlatformModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-white/20 transform transition-all">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add Custom Platform</h3>
                        <input
                            type="text"
                            placeholder="Platform Name"
                            value={newPlatformName}
                            onChange={(e) => setNewPlatformName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all mb-4 text-sm font-medium"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPlatform()}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowCustomPlatformModal(false); setNewPlatformName(''); }}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustomPlatform}
                                disabled={savingPlatform || !newPlatformName.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Google Header - Breadcrumb & Title */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center text-sm text-slate-400 mb-2">
                        <Link to="/admin/jobs" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                            Jobs
                        </Link>
                        <span className="mx-2 text-slate-600">/</span>
                        <span className="text-foreground font-medium truncate max-w-xs">{job.title}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-sm">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-normal text-foreground leading-tight">{job.title}</h1>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mt-1">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location} • {job.job_type}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {applications.length} Candidates</span>
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-secondary/50 text-muted-foreground border-border/20'}`}>
                                        {job.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Apply Links - Compact Buttons */}
                        <div className="flex items-center gap-2">
                            {getAllPlatforms().map((pIcon, idx) => {
                                // Just a simple icon representation if needed, but keeping the dropdown/buttons clean
                                return null;
                            })}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wide">Apply Links:</span>
                                {defaultPlatforms.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => openApplyLink(p)}
                                        className="p-1 hover:scale-105 transition-transform"
                                        title={`Open ${p} Link`}
                                    >
                                        {p === 'linkedin' && (
                                            <div className="w-6 h-6 bg-[#0077b5] rounded flex items-center justify-center text-white shadow-sm">
                                                <Linkedin size={14} fill="currentColor" strokeWidth={0} />
                                            </div>
                                        )}
                                        {p === 'indeed' && (
                                            <div className="w-6 h-6 bg-[#2164f3] rounded flex items-center justify-center text-white font-bold text-[10px] tracking-tight shadow-sm">
                                                IN
                                            </div>
                                        )}
                                        {p === 'glassdoor' && (
                                            <div className="w-6 h-6 bg-[#0caa41] rounded flex items-center justify-center text-white font-bold text-[10px] tracking-tight shadow-sm">
                                                GL
                                            </div>
                                        )}
                                        {p === 'naukri' && (
                                            <div className="w-6 h-6 bg-[#ffe129] rounded flex items-center justify-center text-slate-800 font-bold text-[10px] tracking-tight shadow-sm border border-yellow-400/50">
                                                NK
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {customPlatforms.map((p, i) => (
                                    <button
                                        key={`custom-${i}`}
                                        onClick={() => openApplyLink(p)}
                                        className="p-1 hover:scale-105 transition-transform"
                                        title={`Open ${p} Link`}
                                    >
                                        <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center text-white font-bold text-[10px] tracking-tight shadow-sm uppercase">
                                            {p.slice(0, 2)}
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowCustomPlatformModal(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition-colors"
                                >
                                    <Plus size={14} /> Custom
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar - Google Style */}
            <div className="sticky top-[89px] z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search candidates by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input w-full pl-11 pr-4 py-2 rounded-full text-sm placeholder:text-muted-foreground text-foreground bg-input/20 focus:bg-input/30 border border-border focus:border-primary/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        {/* Skill Filter Input */}
                        <div className="relative w-40 md:w-48">
                            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by Skill..."
                                value={filterSkill}
                                onChange={(e) => setFilterSkill(e.target.value)}
                                className="glass-input w-full pl-9 pr-3 py-1.5 rounded-full text-xs font-medium"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="glass-input text-xs font-medium rounded-full px-4 py-1.5 cursor-pointer max-w-[120px]"
                        >
                            <option>All Status</option>
                            <option value="NEW">New</option>
                            <option value="SCREENED">Screened</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select
                            value={filterPlatform}
                            onChange={(e) => setFilterPlatform(e.target.value)}
                            className="glass-input text-xs font-medium rounded-full px-4 py-1.5 cursor-pointer max-w-[120px]"
                        >
                            <option>All Platforms</option>
                            <option value="LINKEDIN">LinkedIn</option>
                            <option value="INDEED">Indeed</option>
                            <option value="GLASSDOOR">Glassdoor</option>
                            <option value="NAUKRI">Naukri</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${showAdvancedFilters ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                            <SlidersHorizontal size={14} /> Filters
                        </button>
                    </div>
                </div>
                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <div className="max-w-[1600px] mx-auto mt-3 pt-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        {allQuestions.map((q, i) => (
                            <div key={i}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate" title={q.question}>{q.question}</label>
                                <input
                                    type="text"
                                    placeholder="Value..."
                                    className="glass-input w-full rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                                    value={questionFilters[q.question] || ''}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, [q.question]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content - Candidate Table */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4 min-w-[180px]">Status</th>
                                    <th className="px-6 py-4">Experience</th>
                                    <th className="px-6 py-4">Current CTC</th>
                                    <th className="px-6 py-4">Expected CTC</th>
                                    <th className="px-6 py-4">Skills</th>
                                    {allQuestions.map((q, i) => (
                                        <th key={i} className="px-6 py-4 min-w-[200px]" title={q.question}>
                                            {q.question}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm cursor-pointer">
                                {filteredApps.map((app) => (
                                    <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4" onClick={() => { setSelectedApp(app); setShowAnswersModal(true); }}>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                                    {app.candidate_details.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{app.candidate_details.name}</div>
                                                    <div className="text-xs text-slate-500">{app.candidate_details.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative group/select w-full">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                    className={`appearance-none w-full py-1.5 pl-3 pr-8 text-xs font-bold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f172a] transition-all
                                                        ${app.status === 'NEW' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                                                            app.status === 'SCREENED' ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' :
                                                                app.status === 'INTERVIEW' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' :
                                                                    app.status === 'OFFER' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                                                        'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                        }`}
                                                >
                                                    <option value="NEW">New</option>
                                                    <option value="SCREENED">Screened</option>
                                                    <option value="INTERVIEW">Interview</option>
                                                    <option value="OFFER">Offer</option>
                                                    <option value="REJECTED">Rejected</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-foreground" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{app.total_years_experience || app.experience_years || 0} Years</td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{app.current_ctc || 0} LPA</td>
                                        <td className="px-6 py-4 text-emerald-400 font-mono text-xs font-bold">{app.expected_ctc || 0} LPA</td>
                                        {/* Skills - Micro Chips */}
                                        <td className="px-6 py-2 align-middle relative">
                                            <div className="flex flex-wrap gap-1.5 items-center max-w-[220px]">
                                                {app.skills && app.skills.length > 0 ? (
                                                    <>
                                                        {app.skills.slice(0, 3).map((skill, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100 truncate max-w-[80px]">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {app.skills.length > 3 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedSkillsAppId(expandedSkillsAppId === app.id ? null : app.id);
                                                                }}
                                                                className="px-2 py-0.5 text-[10px] text-slate-500 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 transition-colors"
                                                            >
                                                                +{app.skills.length - 3}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : <span className="text-gray-400 text-xs">-</span>}
                                            </div>
                                            {/* Expanded Skills Popover */}
                                            {expandedSkillsAppId === app.id && (
                                                <div
                                                    className="absolute left-0 top-full z-50 mt-1 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-xs font-semibold text-gray-900">All Skills ({app.skills.length})</h4>
                                                        <button
                                                            onClick={() => setExpandedSkillsAppId(null)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                                        {app.skills.map((skill, i) => (
                                                            <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-[10px] border border-gray-100">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        {allQuestions.map((q, i) => {
                                            const ans = app.answers?.find(a => a.question === q.question);
                                            return (
                                                <td key={i} className="px-6 py-4">
                                                    <div className="truncate max-w-[200px] text-xs text-slate-500" title={ans ? ans.answer : ''}>
                                                        {ans ? ans.answer : '-'}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    const existingNote = app.notes || "";
                                                    setNewComment(existingNote);
                                                    setSelectedApp(app);
                                                    setShowAnswersModal(true);
                                                    setActiveTab('notes');
                                                }}
                                                className={`p-2 rounded-full transition-colors mr-2 ${app.notes ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-slate-500 hover:text-amber-400 hover:bg-white/10'}`}
                                                title="Notes"
                                            >
                                                <MessageSquare size={16} fill={app.notes ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedApp(app); setShowAnswersModal(true); }}
                                                className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/10 rounded-full transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredApps.length === 0 && (
                                    <tr>
                                        <td colSpan="100%" className="px-6 py-20 text-center text-slate-500">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <Search size={24} className="text-slate-400" />
                                            </div>
                                            <p className="font-medium text-foreground">No candidates found</p>
                                            <p className="text-sm mt-1 text-slate-500">Try adjusting your filters or search terms.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Unified Candidate Detail Slide-Over Drawer (Linear Style) */}
            {showAnswersModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/30 backdrop-blur-[2px] animate-fade-in" onClick={() => { setShowAnswersModal(false); setNewComment(''); }}>
                    <div className="w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-slide-in-right" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                    {selectedApp.candidate_details.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">{selectedApp.candidate_details.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{selectedApp.candidate_details.email}</span>
                                        <span>•</span>
                                        <span>{selectedApp.candidate_details.phone || 'No Phone'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedApp.status}
                                        onChange={(e) => handleStatusUpdate(selectedApp.id, e.target.value)}
                                        className={`appearance-none py-1.5 px-4 pr-8 text-xs font-bold rounded-full border-0 cursor-pointer focus:ring-2 transition-all ${selectedApp.status === 'NEW' ? 'bg-blue-50 text-blue-700' :
                                            selectedApp.status === 'SCREENED' ? 'bg-indigo-50 text-indigo-700' :
                                                selectedApp.status === 'INTERVIEW' ? 'bg-purple-50 text-purple-700' :
                                                    selectedApp.status === 'OFFER' ? 'bg-green-50 text-green-700' :
                                                        'bg-red-50 text-red-700'
                                            }`}
                                    >
                                        <option value="NEW">NEW</option>
                                        <option value="SCREENED">SCREENED</option>
                                        <option value="INTERVIEW">INTERVIEW</option>
                                        <option value="OFFER">OFFER</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                </div>
                                <button
                                    onClick={() => { setShowAnswersModal(false); setNewComment(''); }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-6">
                            {['application', 'resume', 'notes'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        if (tab === 'resume' && selectedApp.resume && selectedApp.resume.toLowerCase().endsWith('.docx')) {
                                            handleViewResume(selectedApp);
                                        }
                                    }}
                                    className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950/50 p-6">

                            {/* Application Tab */}
                            {activeTab === 'application' && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Quick Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="glass-panel p-4 flex items-center gap-3 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase size={18} /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Experience</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedApp.total_years_experience || selectedApp.experience_years || 0} Years</p>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 flex items-center gap-3 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><MapPin size={18} /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedApp.current_location || 'Not Specified'}</p>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 flex items-center gap-3 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Download size={18} /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Resume</p>
                                                <a href={selectedApp.resume} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:underline">Download PDF</a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Screening Questions Answers */}
                                    <div className="glass-panel p-6 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <MessageSquare size={16} /> Screening Q&A
                                        </h3>
                                        <div className="space-y-6">
                                            {allQuestions.map((q, i) => {
                                                const ans = selectedApp.answers?.find(a => a.question === q.question);
                                                return (
                                                    <div key={i} className="group">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 group-hover:text-indigo-600 transition-colors">{q.question}</p>
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50">
                                                            {ans ? ans.answer : <span className="text-gray-400 italic">No answer provided</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="glass-panel p-6 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <Wand2 size={16} /> Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedApp.skills && selectedApp.skills.length > 0 ? (
                                                selectedApp.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">No skills parsed from resume.</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Internal Notes - Moved/Duplicated to Application Tab for Visibility */}
                                    <div className="glass-panel p-6 bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <MessageSquare size={16} /> Internal Notes
                                        </h3>
                                        <div className="space-y-4">
                                            <textarea
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all shadow-sm"
                                                rows={3}
                                                placeholder="Add a note (e.g., 'Strong candidate, interview scheduled')..."
                                                value={newComment}
                                                onChange={(e) => {
                                                    setNewComment(e.target.value);
                                                }}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={handleAddComment}
                                                    // Allow saving empty note (to delete it)
                                                    // disabled={!newComment && !selectedApp.notes} 
                                                    className="btn-gemini py-1.5 px-4 text-xs"
                                                >
                                                    Update Note
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resume Tab */}
                            {activeTab === 'resume' && (
                                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="flex-1 bg-gray-100 p-4 transition-all">
                                        {selectedApp.resume.toLowerCase().endsWith('.pdf') ? (
                                            <iframe src={selectedApp.resume} className="w-full h-full rounded shadow border bg-white" title="Resume" />
                                        ) : selectedApp.resume.toLowerCase().endsWith('.docx') ? (
                                            <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 overflow-auto prose prose-sm max-w-none mx-auto">
                                                {docxContent === "Loading preview..." ? (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                        <p>Rendering DOCX preview...</p>
                                                    </div>
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: docxContent }} />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-4">
                                                <FileText size={48} className="opacity-20" />
                                                <p>Preview not available for this file type.</p>
                                                <a href={selectedApp.resume} download className="text-indigo-600 underline font-medium">Download File</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="max-w-2xl mx-auto h-full flex flex-col">
                                    <div className="glass-panel p-6 flex flex-col h-auto min-h-[400px] bg-white/40 dark:bg-gray-800/40 border dark:border-gray-700/50">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">Internal Notes</h3>
                                        <div className="flex-1 mb-4">
                                            {selectedApp.notes ? (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-4 rounded-xl text-amber-900 dark:text-amber-100 text-sm leading-relaxed">
                                                    {selectedApp.notes}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                                    <MessageSquare size={24} className="mb-2 opacity-20" />
                                                    <p className="text-sm">No notes yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Simple Note Editor */}
                                        <div className="mt-auto">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">UPDATE NOTE</label>
                                            <textarea
                                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-900 outline-none resize-none transition-all"
                                                rows={4}
                                                placeholder="Enter your notes here..."
                                                value={newComment}
                                                onChange={(e) => {
                                                    setNewComment(e.target.value);
                                                }}
                                            />
                                            <div className="flex justify-end gap-3 mt-3">
                                                <button
                                                    onClick={() => {
                                                        const existingNote = selectedApp.notes || "";
                                                        setNewComment(existingNote);
                                                    }}
                                                    className="px-4 py-2 text-sm text-gray-500 font-medium hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleAddComment}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                                                >
                                                    Save Note
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}


            {/* Skills Modal - Popover Style for Full List */}
            {
                expandedSkillsAppId && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-[2px]"
                        onClick={() => setExpandedSkillsAppId(null)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-sm">
                                    {applications.find(a => a.id === expandedSkillsAppId)?.candidate_details.name}'s Skills
                                </h3>
                                <button onClick={() => setExpandedSkillsAppId(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto">
                                {applications.find(a => a.id === expandedSkillsAppId)?.skills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default JobDetailsPage;