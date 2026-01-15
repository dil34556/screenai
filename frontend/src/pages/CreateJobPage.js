import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob } from '../services/api';
import { ArrowLeft, Sparkles, Plus, Trash2, CheckCircle2, LayoutDashboard, GripVertical, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('basic'); // basic, details, questions
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: 'Not Specified',
        salary_range: '',
        offered_ctc: 12,
        expected_ctc_limit: 20,
        min_experience: 1,
        notice_period_days: 30,
        job_type: 'ONSITE',
        required_skills: '',
        previous_companies: '',
        previous_roles: '',
        description: ''
    });

    const [questions, setQuestions] = useState([]);

    // Detailed Question State
    const [currentQ, setCurrentQ] = useState({
        question: '',
        type: 'long_text',
        options: [],
        min: 0,
        max: 10,
        required: false
    });

    const [newOption, setNewOption] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addOptionRaw = () => {
        if (!newOption.trim()) return;
        setCurrentQ({ ...currentQ, options: [...currentQ.options, newOption.trim()] });
        setNewOption('');
    };

    const removeOptionRaw = (idx) => {
        setCurrentQ({ ...currentQ, options: currentQ.options.filter((_, i) => i !== idx) });
    };

    const handleAddQuestion = () => {
        if (!currentQ.question.trim()) return;

        if (['dropdown', 'multiple_choice'].includes(currentQ.type) && currentQ.options.length === 0) {
            alert('Please add at least one option for this question type.');
            return;
        }

        if (currentQ.type === 'numerical' && (Number(currentQ.min) >= Number(currentQ.max))) {
            alert('Min value must be less than Max value.');
            return;
        }

        setQuestions([...questions, { ...currentQ, id: Date.now() }]);
        setCurrentQ({ question: '', type: 'long_text', options: [], min: 0, max: 10, required: false });
        setNewOption('');
    };

    const handleRemoveQuestion = (idx) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                required_skills: formData.required_skills.split(',').map(s => s.trim()),
                previous_companies: formData.previous_companies ? formData.previous_companies.split(',').map(s => s.trim()) : [],
                previous_roles: formData.previous_roles ? formData.previous_roles.split(',').map(s => s.trim()) : [],
                screening_questions: questions
            };

            await createJob(payload);
            navigate('/admin/jobs');
        } catch (error) {
            console.error(error);
            alert('Failed to post job.');
        }
    };

    return (
        <div className="min-h-full bg-[#FDFDF5] text-[#1F1F1F] font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/jobs" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <h1 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Create New Role</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-400 hidden sm:block">Draft - Unsaved</span>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 pt-12 pb-32 flex items-start gap-12">
                {/* Left: Navigation Steps - Sticky */}
                <div className="hidden lg:block w-64 sticky top-24 shrink-0">
                    <nav className="space-y-1">
                        {[
                            { id: 'basic', label: 'Basic Info', desc: 'Title, Location, Salary' },
                            { id: 'details', label: 'Job Details', desc: 'Description, Requirements' },
                            { id: 'questions', label: 'Screening', desc: 'Custom Questions' }
                        ].map((step) => (
                            <button
                                key={step.id}
                                onClick={() => {
                                    setActiveSection(step.id);
                                    document.getElementById(`section-${step.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${activeSection === step.id
                                    ? 'bg-blue-50 border-blue-100 shadow-sm'
                                    : 'border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`text-sm font-bold mb-0.5 ${activeSection === step.id ? 'text-blue-700' : 'text-gray-600'}`}>{step.label}</div>
                                <div className={`text-xs font-medium ${activeSection === step.id ? 'text-blue-500' : 'text-gray-400'}`}>{step.desc}</div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: Form Area */}
                <div className="flex-1 max-w-2xl space-y-12 pb-40">

                    {/* Basic Info Section */}
                    <motion.div id="section-basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm scroll-mt-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900">Basic Information</h2>
                                <p className="text-sm text-gray-500">Core details for the position.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Product Designer"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        required
                                        onChange={handleChange}
                                        placeholder="e.g. Design"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Type</label>
                                    <div className="relative">
                                        <select
                                            name="job_type"
                                            value={formData.job_type}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="ONSITE">On-site</option>
                                            <option value="REMOTE">Remote</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                        <ChevronRight className="rotate-90 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            {['ONSITE', 'HYBRID'].includes(formData.job_type) && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        onChange={handleChange}
                                        placeholder="e.g. San Francisco, CA"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Details Section */}
                    <motion.div id="section-details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm scroll-mt-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900">Job Details</h2>
                                <p className="text-sm text-gray-500">Describe the role and requirements.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                                <textarea
                                    name="description"
                                    rows={12}
                                    required
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 leading-relaxed resize-none"
                                    placeholder="Describe the role details, responsibilities, and benefits..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Required Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    name="required_skills"
                                    onChange={handleChange}
                                    placeholder="React, Node.js, TypeScript"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Questions Section */}
                    <motion.div id="section-questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm scroll-mt-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900">Screening Questions</h2>
                                <p className="text-sm text-gray-500">Filter candidates with custom questions.</p>
                            </div>
                        </div>

                        {/* Added Questions List */}
                        {questions.length > 0 && (
                            <div className="space-y-3 mb-8">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="group flex items-start justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm mb-1">{q.question}</p>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">{q.type}</span>
                                                {q.required && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">Required</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveQuestion(idx)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Question Builder */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 dashed-border">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Add New Question</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={currentQ.question}
                                    onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
                                    placeholder="e.g. How many years of experience do you have?"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select
                                            value={currentQ.type}
                                            onChange={(e) => setCurrentQ({ ...currentQ, type: e.target.value, options: [] })}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="long_text">Text Answer</option>
                                            <option value="numerical">Numerical</option>
                                            <option value="dropdown">Dropdown</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                        </select>
                                        <ChevronRight className="rotate-90 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                    <div className="flex items-center gap-2 pl-2">
                                        <input
                                            type="checkbox"
                                            id="req"
                                            checked={currentQ.required}
                                            onChange={(e) => setCurrentQ({ ...currentQ, required: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="req" className="text-sm font-medium text-gray-700 cursor-pointer">Required Question</label>
                                    </div>
                                </div>

                                {['dropdown', 'multiple_choice'].includes(currentQ.type) && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                        <div className="flex gap-2">
                                            <input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Enter option value..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                                            <button onClick={addOptionRaw} type="button" className="text-xs font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors">Add</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {currentQ.options.map((opt, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium border border-blue-100">
                                                    {opt} <button type="button" onClick={() => removeOptionRaw(i)} className="hover:text-red-500 transition-colors">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleAddQuestion} type="button" className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all flex items-center justify-center gap-2 mt-2">
                                    <Plus size={18} /> Add Question to List
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-10">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                Publish Job Post
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateJobPage;
