
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getJobDetail, submitApplication, previewResume, quickScanResume } from '../services/api';
import { ArrowLeft, UploadCloud, CheckCircle2, FileText, ChevronRight, Loader2, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';

const ApplyPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
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
        } catch (err) {
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 animate-fade-in relative z-50">
            <div className="bg-white p-12 text-center max-w-md w-full rounded-[30px] shadow-2xl shadow-indigo-500/10 border border-slate-100">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-heading font-medium text-slate-800 mb-2 tracking-tight">Application Sent!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Thanks for applying to <br />
                    <strong className="text-slate-900">{job.title}</strong>
                </p>
                <div className="space-y-4">
                    <button onClick={() => navigate('/')} className="w-full py-4 rounded-full bg-[#4F46E5] hover:bg-[#4338ca] text-white font-bold transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 text-lg">
                        Return to Home
                    </button>
                    <button onClick={() => navigate('/jobs')} className="w-full text-[#6366F1] font-semibold text-sm hover:text-[#4F46E5] py-2 transition-colors">
                        Apply to another role
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/5 mb-8 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to={`/jobs/${jobId}`} className="group flex items-center text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 border border-border/30 flex items-center justify-center mr-3 group-hover:border-border/50 transition-colors shadow-sm">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Job
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-indigo-500 shadow-glow-sm" />
                        <span className="font-heading font-bold text-foreground text-lg tracking-tight">ScreenAI</span>
                    </div>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-32">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading font-light text-foreground mb-4 tracking-tight">
                        {job.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
                        Complete your application below. upload your resume to autofill your details instantly.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">

                    {/* Resume Upload - Hero Section */}
                    <div className="glass-panel p-1 rounded-3xl border border-border/10 bg-card/40">
                        <div className={`relative border-2 border-dashed rounded-[1.4rem] p-10 transition-all duration-300 text-center
                            ${formData.resume
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-border/20 hover:border-indigo-500/50 hover:bg-secondary/20'
                            }`}
                        >
                            <input
                                id="resume-input"
                                type="file"
                                name="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={handleChange}
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                style={{ display: formData.resume ? 'none' : 'block' }}
                            />

                            {formData.resume && (
                                <input
                                    type="file"
                                    id="resume-input-hidden"
                                    name="resume"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                            )}

                            {formData.resume ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-500/20">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="font-bold text-foreground text-xl tracking-tight mb-1">{formData.resume.name}</h3>
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm bg-emerald-500/10 px-3 py-1 rounded-full mt-2 border border-emerald-500/20">
                                        <CheckCircle2 size={14} />
                                        <span>File selected</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('resume-input').click();
                                        }}
                                        className="mt-6 text-sm text-slate-500 hover:text-indigo-400 font-semibold underline decoration-2 underline-offset-4 relative z-30 transition-colors"
                                    >
                                        Replace File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-secondary/50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-border/30 group-hover:scale-110 transition-transform duration-300">
                                        <UploadCloud size={32} />
                                    </div>
                                    <h3 className="font-bold text-foreground text-xl mb-2 tracking-tight">Upload your Resume</h3>
                                    <p className="text-muted-foreground text-sm mb-6">Drag and drop or click to browse (PDF, DOCX)</p>
                                    <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold shadow-lg shadow-white/5 hover:bg-foreground/90 transition-all">
                                        Select File
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Personal Info - Auto-filled */}
                    <div className="glass-panel p-8 md:p-10 rounded-3xl border border-border/10 bg-card/40 relative overflow-hidden">
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                                <span className="font-bold text-foreground text-lg">Extracting details from resume...</span>
                                <span className="text-muted-foreground text-sm mt-1">This will just take a moment</span>
                            </div>
                        )}

                        <h3 className="text-xl font-heading font-semibold text-foreground mb-8 flex items-center gap-2">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full mr-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            Personal Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    disabled={isAnalyzing}
                                    placeholder="Your full name"
                                    className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={isAnalyzing}
                                    placeholder="name@example.com"
                                    className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={isAnalyzing}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Experience & Expectations */}
                    <div className="glass-panel p-8 md:p-10 rounded-3xl border border-border/10 bg-card/40">
                        <h3 className="text-xl font-heading font-semibold text-foreground mb-8 flex items-center gap-2">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full mr-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            Experience & Expectations
                            {isDeepAnalyzing && (
                                <span className="ml-auto flex items-center gap-2 text-xs font-medium text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-full animate-pulse border border-indigo-500/20">
                                    <Sparkles size={12} />
                                    AI Analyzing details...
                                </span>
                            )}
                        </h3>

                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm font-bold text-muted-foreground">Total Experience</label>
                                    <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{formData.experience_years} Years</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    name="experience_years"
                                    value={formData.experience_years}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Fresh</span>
                                    <span>15 Years</span>
                                    <span>30+ Years</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-muted-foreground">Current CTC</label>
                                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{formData.current_ctc} LPA</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="0.5"
                                        name="current_ctc"
                                        value={formData.current_ctc}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-muted-foreground">Expected CTC</label>
                                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{formData.expected_ctc} LPA</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        name="expected_ctc"
                                        value={formData.expected_ctc}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm font-bold text-muted-foreground">Notice Period</label>
                                    <span className="text-sm font-bold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg border border-border/20">{formData.notice_period} Days</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="15"
                                    name="notice_period"
                                    value={formData.notice_period}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-slate-500"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Immediate</span>
                                    <span>1 Month</span>
                                    <span>3 Months</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screening Questions */}
                    {job.screening_questions && job.screening_questions.length > 0 && (
                        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-border/10 bg-card/40">
                            <h3 className="text-xl font-heading font-semibold text-foreground mb-8 flex items-center gap-2">
                                <div className="w-1 h-6 bg-indigo-500 rounded-full mr-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                Additional Questions
                            </h3>
                            <div className="space-y-8">
                                {job.screening_questions.map((q, idx) => (
                                    <div key={idx}>
                                        <label className="block text-sm font-bold text-muted-foreground mb-3">{q.question} {q.required && <span className="text-red-400">*</span>}</label>
                                        {(q.type === 'short_text' || q.type === 'text' || !q.type) && (
                                            <input
                                                type="text"
                                                required={q.required}
                                                onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all outline-none"
                                                placeholder="Your answer"
                                            />
                                        )}
                                        {q.type === 'long_text' && (
                                            <textarea
                                                rows={3}
                                                required={q.required}
                                                onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all outline-none min-h-[100px]"
                                                placeholder="Your answer"
                                            />
                                        )}
                                        {q.type === 'dropdown' && (
                                            <div className="relative">
                                                <select
                                                    required={q.required}
                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    className="w-full bg-input/20 border border-border/30 rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled className="bg-card">Select an option</option>
                                                    {q.options && q.options.map((opt, i) => <option key={i} value={opt} className="bg-card text-foreground">{opt}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <ChevronRight className="rotate-90" size={16} />
                                                </div>
                                            </div>
                                        )}
                                        {q.type === 'multiple_choice' && (
                                            <div className="space-y-3 mt-2">
                                                {q.options && q.options.map((opt, i) => (
                                                    <label key={i} className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-border/10 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40 transition-all group">
                                                        <input
                                                            type="radio"
                                                            required={q.required}
                                                            name={`question_${idx}`}
                                                            value={opt}
                                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                            className="h-4 w-4 text-primary focus:ring-primary border-border/50 bg-input/50"
                                                        />
                                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-2 animate-shake shadow-sm">
                            <ShieldCheck size={18} />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 pb-20">
                        <button
                            type="submit"
                            disabled={loading || !formData.resume}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl
                                ${loading || !formData.resume
                                    ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed border border-border/10'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1 shadow-indigo-500/20'
                                }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default ApplyPage;
