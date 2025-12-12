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
        linkedin_url: '',
        resume: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

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

    const [answers, setAnswers] = useState({});

    // ... useEffect ...

    // ... handleChange ...

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
        data.append('linkedin_url', formData.linkedin_url);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="phone" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                            <input type="url" name="linkedin_url" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="resume" type="file" accept=".pdf" required onChange={handleChange} className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                {formData.resume && (
                                    <p className="text-sm text-green-600 font-semibold mt-2">Selected: {formData.resume.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Screening Questions Section */}
                    {job.screening_questions && job.screening_questions.length > 0 && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Screening Questions</h3>
                            <div className="space-y-6">
                                {job.screening_questions.map((q, idx) => {
                                    // Handle Legacy format (if any) or new Format
                                    const type = q.type || 'short_text';
                                    const isRequired = q.required || false;

                                    return (
                                        <div key={idx}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {q.question} {isRequired && <span className="text-red-500">*</span>}
                                            </label>

                                            {/* RENDER INPUT BASED ON TYPE */}
                                            {type === 'short_text' && (
                                                <input
                                                    type="text"
                                                    required={isRequired}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border"
                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                />
                                            )}

                                            {type === 'long_text' && (
                                                <textarea
                                                    rows={4}
                                                    required={isRequired}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                />
                                            )}

                                            {type === 'dropdown' && (
                                                <select
                                                    required={isRequired}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border"
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

                                            {/* Fallback for 'number' type from previous version, treated as short_text with type=number */}
                                            {type === 'number' && (
                                                <input
                                                    type="number"
                                                    required={isRequired}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10 px-3 border"
                                                    onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplyPage;
