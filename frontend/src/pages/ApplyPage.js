
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getJobDetail, submitApplication, previewResume, quickScanResume } from '../services/api';
import { ArrowLeft, UploadCloud, CheckCircle2, FileText, Loader2, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

const ApplyPage = () => {
    const { jobId } = useParams();
    // const navigate = useNavigate(); // Unused
    const location = useLocation();
    const [job, setJob] = useState(null);
    const [platform, setPlatform] = useState('Website');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience_years: 0,
        current_ctc: 0,
        expected_ctc: 0,
        notice_period: 30,
        skills: '',
        experiences: [],
        resume: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        // Extract platform from URL query parameter
        const searchParams = new URLSearchParams(location.search);
        const platformParam = searchParams.get('platform');
        if (platformParam) {
            setPlatform(platformParam);
        }

        const fetchJob = async () => {
            try {
                const data = await getJobDetail(jobId);
                setJob(data);
            } catch (err) {
                setError("Job not found.");
            }
        };
        fetchJob();
    }, [jobId, location.search]);


    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'resume' && files && files[0]) {
            const file = files[0];
            setFormData((prev) => ({ ...prev, resume: file }));
            handleResumeAutoFill(file);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);

    const handleResumeAutoFill = async (file) => {
        setIsAnalyzing(true);
        // Reset deep analysis state
        setIsDeepAnalyzing(true);

        const data = new FormData();
        data.append('resume', file);

        // 1. Quick Scan (Regex) - Instant Feedback for Contact Info
        try {
            const quickResult = await quickScanResume(data);

            if (quickResult && quickResult.data) {
                const { candidate_name, email, phone } = quickResult.data;
                console.log("Quick Scan Result:", quickResult.data);

                setFormData(prev => ({
                    ...prev,
                    name: candidate_name || prev.name,
                    email: email || prev.email,
                    phone: phone || prev.phone
                }));
            }
        } catch (quickErr) {
            console.warn("Quick scan failed", quickErr);
        } finally {
            // RELEASE BLOCKING UI HERE
            setIsAnalyzing(false);
        }

        // 2. Full Parse (AI) - Background - Deep Analysis for Skills & Exp
        try {
            const result = await previewResume(data);

            if (result && result.data) {
                const { candidate_name, email, phone, total_years_experience, skills, work_experience } = result.data;

                // Ensure experience is a number for the slider
                let parsedExp = 0;
                if (total_years_experience) {
                    parsedExp = parseFloat(total_years_experience);
                    if (isNaN(parsedExp)) parsedExp = 0;
                }

                // Format Skills (ensure array -> string)
                let skillsStr = "";
                if (Array.isArray(skills)) {
                    skillsStr = skills.join(", ");
                } else if (typeof skills === 'string') {
                    skillsStr = skills;
                }

                // Format Experience
                let parsedExperiences = [];
                if (Array.isArray(work_experience)) {
                    parsedExperiences = work_experience.map(exp => ({
                        company: exp.company_name || "",
                        role: exp.job_role || "",
                        duration: exp.duration || ""
                    }));
                }

                setFormData(prev => ({
                    ...prev,
                    // Use AI result if available and better
                    name: (candidate_name && candidate_name.length > (prev.name?.length || 0)) ? candidate_name : prev.name,
                    email: email || prev.email,
                    phone: phone || prev.phone,
                    experience_years: parsedExp || prev.experience_years,
                    skills: skillsStr || prev.skills,
                    experiences: parsedExperiences.length > 0 ? parsedExperiences : prev.experiences
                }));
            }
        } catch (err) {
            console.error("Autofill failed", err);
        } finally {
            setIsDeepAnalyzing(false);
        }
    };

    const handleAnswerChange = (question, value) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('job', jobId);
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('platform', platform);

        data.append('experience_years', formData.experience_years);
        if (formData.current_ctc) data.append('current_ctc', formData.current_ctc);
        if (formData.expected_ctc) data.append('expected_ctc', formData.expected_ctc);
        data.append('notice_period', formData.notice_period);
        if (formData.resume) data.append('resume', formData.resume);

        if (formData.skills) data.append('skills', formData.skills);
        if (formData.experiences && formData.experiences.length > 0) {
            data.append('experiences', JSON.stringify(formData.experiences));
        }

        const answersList = Object.entries(answers).map(([q, a]) => ({ question: q, answer: a }));
        data.append('answers', JSON.stringify(answersList));

        try {
            await submitApplication(data);
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Submission failed:", err);
            setError("Application failed. Please check your data and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!job) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDF5] px-4 animate-fade-in relative z-50">
            <div className="bg-white p-12 text-center max-w-md w-full rounded-[24px] border border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                    <CheckCircle2 size={40} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-heading font-medium text-[#1F1F1F] mb-3 tracking-tight">Application Sent</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Thank you for applying to<br />
                    <strong className="text-[#1F1F1F]">{job.title}</strong>
                </p>

            </div>
        </div>
    );

    return (
        <div className="h-screen bg-[#FDFDF5] text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden flex flex-col">

            {/* 1. Top Bar - Minimal */}
            <header className="h-16 shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
                <Link to={`/jobs/${jobId}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <ArrowLeft size={16} />
                    </div>
                    <span>Back to Job</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md shadow-sm flex items-center justify-center">
                        <span className="text-white font-bold text-xs">S</span>
                    </div>
                    <span className="font-medium text-lg tracking-tight">ScreenAI</span>
                </div>
                <div className="w-24"></div> {/* Spacer */}
            </header>

            {/* 2. Main Content - TWO COLUMN GRID */}
            <main className="flex-1 min-h-0 flex flex-col md:flex-row relative">

                {/* --- LEFT COLUMN: Basics (Scrollable unique to this col if needed, but intended to fit) --- */}
                <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-6">
                        {/* Job Info */}
                        <div>
                            <h1 className="text-2xl font-normal text-gray-900 mb-2 leading-tight">{job.title}</h1>
                            <p className="text-sm text-gray-500">{job.location || 'Remote'} • {job.type || 'Full Time'}</p>
                        </div>

                        {/* Resume Upload - Compact */}
                        <div className={`relative border border-dashed rounded-xl p-6 transition-all text-center
                            ${formData.resume ? 'border-blue-500/30 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>

                            <input id="resume-input" type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />

                            {formData.resume ? (
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{formData.resume.name}</p>
                                        <p className="text-xs text-blue-600 font-medium cursor-pointer relative z-30 hover:underline">Change File</p>
                                    </div>
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                </div>
                            ) : (
                                <div>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <UploadCloud size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Upload Resume</p>
                                    <p className="text-xs text-gray-400 mt-1">Auto-fill details instantly</p>
                                </div>
                            )}
                        </div>

                        {/* Personal Details - Dense */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Info</h3>
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4 relative">
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                                        <Loader2 size={24} className="animate-spin text-blue-600" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} disabled={isAnalyzing} placeholder="John Doe"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={isAnalyzing} placeholder="john@example.com"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} disabled={isAnalyzing} placeholder="+1 555 000 0000"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Form Questions (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDFDF5] relative flex flex-col">
                    <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 max-w-3xl mx-auto w-full space-y-10">

                        {/* Experience Section */}
                        <section>
                            <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                Experience & Expectations
                                {isDeepAnalyzing && <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse flex items-center gap-1"><Sparkles size={12} /> AI analyzing...</span>}
                            </h3>

                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-8">
                                {/* Total Exp */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Total Experience</label>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formData.experience_years} Years</span>
                                    </div>
                                    <input type="range" min="0" max="30" step="1" name="experience_years" value={formData.experience_years} onChange={handleChange}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Current CTC */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Current CTC</label>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{formData.current_ctc} LPA</span>
                                        </div>
                                        <input type="range" min="0" max="50" step="0.5" name="current_ctc" value={formData.current_ctc} onChange={handleChange}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600" />
                                    </div>
                                    {/* Expected CTC */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Expected CTC</label>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{formData.expected_ctc} LPA</span>
                                        </div>
                                        <input type="range" min="0" max="100" step="0.5" name="expected_ctc" value={formData.expected_ctc} onChange={handleChange}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600" />
                                    </div>
                                </div>

                                {/* Notice Period */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Notice Period</label>
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{formData.notice_period} Days</span>
                                    </div>
                                    <input type="range" min="0" max="90" step="15" name="notice_period" value={formData.notice_period} onChange={handleChange}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-500" />
                                    <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                                        <span>Immediate</span>
                                        <span>3 Months</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Screening Questions */}
                        {job.screening_questions && job.screening_questions.length > 0 && (
                            <section>
                                <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                                    Details
                                </h3>
                                <div className="space-y-6">
                                    {job.screening_questions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-900 mb-3">{q.question} {q.required && <span className="text-red-500">*</span>}</label>

                                            {(q.type === 'short_text' || q.type === 'text' || !q.type) && (
                                                <input type="text" required={q.required} onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-purple-500/10 placeholder:text-gray-400"
                                                    placeholder="Type your answer here..." />
                                            )}

                                            {q.type === 'long_text' && (
                                                <textarea rows={3} required={q.required} onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-purple-500/10 placeholder:text-gray-400 min-h-[80px]"
                                                    placeholder="Type your answer here..." />
                                            )}

                                            {q.type === 'numerical' && (
                                                <input type="number" required={q.required} onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-purple-500/10 placeholder:text-gray-400"
                                                    placeholder="0" />
                                            )}

                                            {q.type === 'dropdown' && (
                                                <div className="relative">
                                                    <select required={q.required} onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500/10">
                                                        <option value="" disabled selected>Select an option</option>
                                                        {q.options && q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <ChevronRight className="rotate-90 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                            )}

                                            {q.type === 'multiple_choice' && (
                                                <div className="space-y-3">
                                                    {q.options && q.options.map((opt, i) => (
                                                        <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`question_${idx}`}
                                                                    value={opt}
                                                                    required={q.required}
                                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                                    className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                                                                />
                                                                <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                                                            </div>
                                                            <span className="text-sm text-gray-700 font-medium">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="pt-8 pb-12">
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <ShieldCheck size={18} /> {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading || !formData.resume}
                                className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg
                                    ${loading || !formData.resume ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:-translate-y-0.5 shadow-gray-900/10'}`}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ApplyPage;
