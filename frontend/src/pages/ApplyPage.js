import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobDetail, submitApplication, previewResume } from '../services/api';
import { ArrowLeft, UploadCloud, CheckCircle2, FileText, ChevronRight, Loader2 } from 'lucide-react';

const ApplyPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience_years: 0,
        current_ctc: 0,
        expected_ctc: 0,
        notice_period: 30,
        resume: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await getJobDetail(jobId);
                setJob(data);
            } catch (err) {
                setError("Job not found.");
            }
        };
        fetchJob();
    }, [jobId]);

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

    const handleResumeAutoFill = async (file) => {
        setIsAnalyzing(true);
        const data = new FormData();
        data.append('resume', file);

        try {
            const result = await previewResume(data);

            if (result && result.data) {
                const { candidate_name, email, phone, total_years_experience } = result.data;

                // Ensure experience is a number for the slider
                let parsedExp = 0;
                if (total_years_experience) {
                    parsedExp = parseFloat(total_years_experience);
                    if (isNaN(parsedExp)) parsedExp = 0;
                }

                setFormData(prev => ({
                    ...prev,
                    name: candidate_name || prev.name,
                    email: email || prev.email,
                    phone: phone || prev.phone,
                    experience_years: parsedExp || prev.experience_years
                }));
            }
        } catch (err) {
            console.error("Autofill failed", err);
        } finally {
            setIsAnalyzing(false);
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
        // Explicitly format numbers if needed, but JS FormData handles typical types well
        data.append('experience_years', formData.experience_years);
        if (formData.current_ctc) data.append('current_ctc', formData.current_ctc);
        if (formData.expected_ctc) data.append('expected_ctc', formData.expected_ctc);
        data.append('notice_period', formData.notice_period);
        if (formData.resume) data.append('resume', formData.resume);

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="animate-spin text-slate-500" size={32} />
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="text-center max-w-md w-full">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Application Sent!</h2>
                <p className="text-slate-400 mb-8">Thanks for applying to <strong>{job.title}</strong>.</p>
                <div className="space-y-3">
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                        Return to Home
                    </button>
                    <button onClick={() => window.location.reload()} className="w-full py-3 text-indigo-400 font-semibold text-sm hover:underline">
                        Apply to another role
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to={`/jobs/${jobId}`} className="flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </Link>
                    <div className="font-semibold text-white">{job.title}</div>
                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Complete your application</h1>
                    <p className="text-slate-400">Auto-fill is enabled. Upload your resume to start.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* 1. Resume Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-200">Resume</label>
                        <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${formData.resume ? 'border-green-500/50 bg-green-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}>
                            <div className="flex flex-col items-center text-center">
                                {formData.resume ? (
                                    <>
                                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-3">
                                            <FileText size={24} />
                                        </div>
                                        <p className="font-semibold text-white">{formData.resume.name}</p>
                                        <p className="text-sm text-green-400 mt-1">Ready to go</p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('resume-input').click();
                                            }}
                                            className="text-xs text-slate-400 mt-4 hover:text-white underline"
                                        >
                                            Change file
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-3">
                                            <UploadCloud size={24} />
                                        </div>
                                        <p className="font-medium text-slate-300">Click to upload or drag and drop</p>
                                        <p className="text-sm text-slate-500 mt-1">PDF, DOCX (Max 10MB)</p>
                                    </>
                                )}
                                <input
                                    id="resume-input"
                                    type="file"
                                    name="resume"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleChange}
                                    required
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    // Make sure this doesn't block the change button click
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
                            </div>
                        </div>
                    </div>

                    {/* 2. Personal Info (Read Only / Derived) */}
                    {(formData.resume || isAnalyzing) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                Personal Details
                                {isAnalyzing && <Loader2 size={16} className="animate-spin text-indigo-400" />}
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6 bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        disabled={isAnalyzing}
                                        placeholder={isAnalyzing ? "Extracting..." : "Your Name"}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all disabled:bg-slate-800/50 disabled:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        disabled={isAnalyzing}
                                        placeholder={isAnalyzing ? "Extracting..." : "email@example.com"}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all disabled:bg-slate-800/50 disabled:text-slate-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        disabled={isAnalyzing}
                                        placeholder={isAnalyzing ? "Extracting..." : "+1 234 567 8900"}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all disabled:bg-slate-800/50 disabled:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Stats (Sliders) */}
                    <div className="space-y-8">
                        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Experience & Expectations</h3>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-300">Total Experience</label>
                                <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{formData.experience_years} Years</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                step="1"
                                name="experience_years"
                                value={formData.experience_years}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                <span>Fresh</span>
                                <span>15 Years</span>
                                <span>30+ Years</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-300">Notice Period</label>
                                <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{formData.notice_period} Days</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="90"
                                step="15"
                                name="notice_period"
                                value={formData.notice_period}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                <span>Immediate</span>
                                <span>1 Month</span>
                                <span>3 Months</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-300">Current CTC</label>
                                    <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{formData.current_ctc} LPA</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    name="current_ctc"
                                    value={formData.current_ctc}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                    <span>0 LPA</span>
                                    <span>25 LPA</span>
                                    <span>50+ LPA</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-300">Expected CTC</label>
                                    <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{formData.expected_ctc} LPA</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    name="expected_ctc"
                                    value={formData.expected_ctc}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                    <span>0 LPA</span>
                                    <span>50 LPA</span>
                                    <span>1 Cr+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Questions */}
                    {job.screening_questions && job.screening_questions.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Additional Questions</h3>
                            {job.screening_questions.map((q, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">{q.question} {q.required && <span className="text-red-400">*</span>}</label>
                                    {(q.type === 'short_text' || q.type === 'text' || !q.type) && (
                                        <input
                                            type="text"
                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-500"
                                            placeholder="Your answer"
                                        />
                                    )}
                                    {q.type === 'long_text' && (
                                        <textarea
                                            rows={3}
                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-500"
                                            placeholder="Your answer"
                                        />
                                    )}
                                    {q.type === 'dropdown' && (
                                        <select
                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            defaultValue=""
                                        >
                                            <option value="" disabled className="text-slate-500">Select an option</option>
                                            {q.options && q.options.map((opt, i) => <option key={i} value={opt} className="bg-slate-800 text-white">{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-900/20 text-red-400 rounded-lg text-sm font-medium border border-red-900/30">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 pb-20">
                        <button
                            type="submit"
                            disabled={loading || !formData.resume}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                                ${loading || !formData.resume
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
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
