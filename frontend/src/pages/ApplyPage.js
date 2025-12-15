import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDetail, submitApplication } from '../services/api';

const ApplyPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience_years: '',
        current_ctc: '',
        expected_ctc: '',
        skills: '',
        experiences: [], // Array of { company, role, duration }
        resume: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

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
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleAnswerChange = (question, value) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    // Experience Handlers
    const handleAddExperience = () => {
        setFormData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { company: '', role: '', duration: '' }]
        }));
    };

    const handleExperienceChange = (index, field, value) => {
        const newExp = [...formData.experiences];
        newExp[index][field] = value;
        setFormData(prev => ({ ...prev, experiences: newExp }));
    };

    const handleRemoveExperience = (index) => {
        const newExp = [...formData.experiences];
        newExp.splice(index, 1);
        setFormData(prev => ({ ...prev, experiences: newExp }));
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
        if (formData.experience_years) {
            data.append('experience_years', formData.experience_years);
        }
        if (formData.current_ctc) data.append('current_ctc', formData.current_ctc);
        if (formData.expected_ctc) data.append('expected_ctc', formData.expected_ctc);
        if (formData.skills) data.append('skills', formData.skills);
        if (formData.experiences.length > 0) {
            data.append('experiences', JSON.stringify(formData.experiences));
        }
        data.append('resume', formData.resume);

        // Convert answers object to list for backend
        const answersList = Object.entries(answers).map(([q, a]) => ({ question: q, answer: a }));
        data.append('answers', JSON.stringify(answersList));

        try {
            await submitApplication(data);
            setSuccess(true);
        } catch (err) {
            setError("Application failed. Please check your data or try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!job) return <div className="p-8 text-center text-gray-500">Loading Job Details...</div>;
    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                <h2 className="text-3xl font-bold text-green-600 mb-4">Application Received! 🎉</h2>
                <p className="text-gray-600">Our AI is already reviewing your profile. Good luck!</p>
                <button onClick={() => navigate('/')} className="mt-6 text-indigo-600 hover:underline">Back to Home</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <div className="mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-700">{job.department || 'General'}</span>
                        <span>•</span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-sm">{job.job_type}</span>
                    </p>
                </div>

                <div className="mb-8 prose prose-indigo text-gray-500">
                    <h3 className="text-lg font-semibold text-gray-800">About the Role</h3>
                    <p>{job.description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Material Style Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="e.g. 9876543210"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Skills</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills || ''}
                                onChange={handleChange}
                                placeholder="e.g. Java, Python, React"
                                className="input-premium"
                            />
                        </div>

                        {/* Dynamic Experience Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Previous Experience</label>

                            {formData.experiences.map((exp, index) => (
                                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Experience {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExperience(index)}
                                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <input
                                                placeholder="Company Name"
                                                value={exp.company}
                                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                className="input-premium text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <input
                                                placeholder="Job Role"
                                                value={exp.role}
                                                onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                className="input-premium text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <input
                                                placeholder="Duration (e.g. 2020-2022)"
                                                value={exp.duration}
                                                onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                className="input-premium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddExperience}
                                className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                            >
                                + Add Experience
                            </button>
                        </div>

                        {/* Sliders Section */}
                        <div className="space-y-8 pt-4">
                            {/* Current CTC */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-sm font-medium text-gray-700">Current CTC: <span className="font-bold text-gray-900">{formData.current_ctc} Lakhs</span></label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    name="current_ctc"
                                    value={formData.current_ctc || 0}
                                    onChange={handleChange}
                                    className="w-full h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>

                            {/* Expected CTC */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-sm font-medium text-gray-700">Expected CTC: <span className="font-bold text-gray-900">{formData.expected_ctc} Lakhs</span></label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    name="expected_ctc"
                                    value={formData.expected_ctc || 0}
                                    onChange={handleChange}
                                    className="w-full h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>

                            {/* Notice Period */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-sm font-medium text-gray-700">Your notice period or last day of working: <span className="font-bold text-gray-900">{formData.notice_period || 30} days</span></label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="15"
                                    name="notice_period"
                                    value={formData.notice_period || 0}
                                    onChange={handleChange}
                                    className="w-full h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>

                            {/* Experience */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-sm font-medium text-gray-700">Whats your total years of experience : <span className="font-bold text-gray-900">{formData.experience_years} Years</span></label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    name="experience_years"
                                    value={formData.experience_years || 0}
                                    onChange={handleChange}
                                    className="w-full h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resume (PDF, DOC, DOCX)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="resume" type="file" accept=".pdf,.doc,.docx" required onChange={handleChange} className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                                {formData.resume && (
                                    <p className="text-sm text-green-600 font-semibold mt-2">Selected: {formData.resume.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Screening Questions Section */}
                    {
                        job.screening_questions && job.screening_questions.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Screening Questions</h3>
                                <div className="space-y-6">
                                    {job.screening_questions.map((q, idx) => {
                                        // Handle Legacy format (if any) or new Format
                                        const type = q.type || 'long_text';
                                        const isRequired = q.required || false;

                                        return (
                                            <div key={idx}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {q.question} {isRequired && <span className="text-red-500">*</span>}
                                                </label>

                                                {/* RENDER INPUT BASED ON TYPE */}
                                                {/* Default text input for legacy short_text or if type missing */}
                                                {(type === 'short_text' || type === 'text') && (
                                                    <input
                                                        type="text"
                                                        required={isRequired}
                                                        className="input-premium"
                                                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    />
                                                )}

                                                {type === 'long_text' && (
                                                    <textarea
                                                        rows={4}
                                                        required={isRequired}
                                                        className="input-premium min-h-[100px]"
                                                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                    />
                                                )}

                                                {type === 'dropdown' && (
                                                    <select
                                                        required={isRequired}
                                                        className="input-premium appearance-none"
                                                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select an option</option>
                                                        {q.options && q.options.map((opt, i) => (
                                                            <option key={i} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {type === 'multiple_choice' && (
                                                    <div className="space-y-2">
                                                        {q.options && q.options.map((opt, i) => (
                                                            <div key={i} className="flex items-center">
                                                                <input
                                                                    id={`q-${idx}-opt-${i}`}
                                                                    name={`q-${idx}`} // Group by question index to act as radio group
                                                                    type="radio"
                                                                    value={opt}
                                                                    required={isRequired}
                                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                                                />
                                                                <label htmlFor={`q-${idx}-opt-${i}`} className="ml-3 block text-sm font-medium text-gray-700">
                                                                    {opt}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {type === 'numerical' && (
                                                    <div className="pt-2">
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                            <span>{q.min || 0}</span>
                                                            <span className="font-bold text-indigo-600 text-sm">
                                                                {answers[q.question] || (q.min || 0)}
                                                            </span>
                                                            <span>{q.max || 10}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={q.min || 0}
                                                            max={q.max || 10}
                                                            step="1"
                                                            required={isRequired}
                                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                            defaultValue={q.min || 0}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}
                            `}
                        >
                            {loading ? 'Submitting...' : 'SUBMIT APPLICATION'}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
};

export default ApplyPage;
