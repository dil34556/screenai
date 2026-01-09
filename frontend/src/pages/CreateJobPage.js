import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob } from '../services/api';
import { ArrowLeft, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, LayoutDashboard, GripVertical, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            {/* Header */}
            <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/jobs" className="p-2 hover:bg-secondary/50 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-6 w-px bg-border/20"></div>
                        <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">Create New Role</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground hidden sm:block">Draft - Unsaved</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-28 pb-32 flex gap-12">
                {/* Left: Navigation Steps */}
                <div className="hidden lg:block w-64 fixed h-[calc(100vh-120px)] overflow-y-auto">
                    <nav className="space-y-1">
                        {[
                            { id: 'basic', label: 'Basic Info', desc: 'Title, Location, Salary' },
                            { id: 'details', label: 'Job Details', desc: 'Description, Requirements' },
                            { id: 'questions', label: 'Screening', desc: 'Custom Questions' }
                        ].map((step) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveSection(step.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${activeSection === step.id ? 'bg-secondary/50 border-border/20 shadow-lg' : 'border-transparent hover:bg-secondary/20'}`}
                            >
                                <div className={`text-sm font-bold mb-0.5 ${activeSection === step.id ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                                <div className="text-xs text-muted-foreground/60 font-medium">{step.desc}</div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: Form Area */}
                <div className="flex-1 lg:ml-72 space-y-8 max-w-3xl">

                    {/* Basic Info Section */}
                    {activeSection === 'basic' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[24px]">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <LayoutDashboard size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-light text-foreground">Basic Information</h2>
                                    <p className="text-sm text-muted-foreground">Core details for the position.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Job Title</label>
                                        <input type="text" name="title" required onChange={handleChange} placeholder="e.g. Senior Product Designer" className="glass-input w-full rounded-2xl px-4 py-3" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Department</label>
                                        <input type="text" name="department" required onChange={handleChange} placeholder="e.g. Design" className="glass-input w-full rounded-2xl px-4 py-3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Job Type</label>
                                        <select name="job_type" value={formData.job_type} onChange={handleChange} className="glass-input w-full rounded-xl px-4 py-3 text-foreground">
                                            <option value="ONSITE" className="text-foreground bg-card">On-site</option>
                                            <option value="REMOTE" className="text-foreground bg-card">Remote</option>
                                            <option value="HYBRID" className="text-foreground bg-card">Hybrid</option>
                                        </select>
                                    </div>
                                </div>
                                {['ONSITE', 'HYBRID'].includes(formData.job_type) && (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Location</label>
                                        <input type="text" name="location" required onChange={handleChange} placeholder="e.g. San Francisco, CA" className="glass-input w-full rounded-xl px-4 py-3" />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-8">
                                <button type="button" onClick={() => setActiveSection('details')} className="bg-secondary/50 hover:bg-secondary/80 text-foreground border border-border/10 px-8 py-3 rounded-full transition-all flex items-center shadow-lg hover:shadow-glow">
                                    Next Step <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Details Section */}
                    {activeSection === 'details' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[24px]">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                                <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 border border-purple-500/20">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Job Details</h2>
                                    <p className="text-sm text-muted-foreground">Describe the role and requirements.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Description</label>
                                    <textarea name="description" rows={12} required onChange={handleChange} className="glass-input w-full rounded-xl px-4 py-3 leading-relaxed" placeholder="Describe the role responsibilities..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Required Skills (Comma separated)</label>
                                    <input type="text" name="required_skills" onChange={handleChange} placeholder="React, Node.js, TypeScript" className="glass-input w-full rounded-xl px-4 py-3" />
                                </div>
                            </div>

                            <div className="flex justify-end mt-8 gap-3">
                                <button type="button" onClick={() => setActiveSection('basic')} className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Back</button>
                                <button type="button" onClick={() => setActiveSection('questions')} className="bg-secondary/50 hover:bg-secondary/80 text-foreground border border-border/10 px-6 py-2 rounded-xl transition-all flex items-center shadow-lg">
                                    Next Step <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Questions Section */}
                    {activeSection === 'questions' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[24px]">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                                <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Screening Questions</h2>
                                    <p className="text-sm text-muted-foreground">Add questions to filter candidates.</p>
                                </div>
                            </div>

                            {/* Added Questions List */}
                            {questions.length > 0 && (
                                <div className="space-y-3 mb-8">
                                    {questions.map((q, idx) => (
                                        <div key={idx} className="group flex items-start justify-between bg-card/20 border border-border/10 p-4 rounded-xl hover:border-indigo-500/30 transition-colors">
                                            <div>
                                                <p className="font-bold text-foreground text-sm mb-1">{q.question}</p>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary/20 border border-border/10 px-1.5 py-0.5 rounded">{q.type}</span>
                                                    {q.required && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Required</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveQuestion(idx)} className="text-muted-foreground/50 hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Question Builder */}
                            <div className="bg-card/10 rounded-xl p-6 border border-border/10">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">New Question</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={currentQ.question}
                                        onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
                                        placeholder="e.g. How many years of experience?"
                                        className="glass-input w-full rounded-xl px-4 py-3"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={currentQ.type}
                                            onChange={(e) => setCurrentQ({ ...currentQ, type: e.target.value, options: [] })}
                                            className="glass-input w-full rounded-xl px-4 py-3 text-foreground"
                                        >
                                            <option value="long_text" className="text-foreground bg-card">Text Answer</option>
                                            <option value="numerical" className="text-foreground bg-card">Numerical</option>
                                            <option value="dropdown" className="text-foreground bg-card">Dropdown</option>
                                            <option value="multiple_choice" className="text-foreground bg-card">Multiple Choice</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="req"
                                                checked={currentQ.required}
                                                onChange={(e) => setCurrentQ({ ...currentQ, required: e.target.checked })}
                                                className="w-4 h-4 rounded border-border/20 bg-input/10 text-primary focus:ring-primary/50"
                                            />
                                            <label htmlFor="req" className="text-sm font-medium text-muted-foreground">Required</label>
                                        </div>
                                    </div>

                                    {['dropdown', 'multiple_choice'].includes(currentQ.type) && (
                                        <div className="bg-secondary/10 p-4 rounded-xl border border-border/10 space-y-3">
                                            <div className="flex gap-2">
                                                <input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Add Option" className="glass-input flex-1 py-1.5 px-3 text-sm rounded-lg" />
                                                <button onClick={addOptionRaw} type="button" className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20">Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {currentQ.options.map((opt, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/20 text-foreground text-xs rounded-md font-medium border border-border/10">
                                                        {opt} <button type="button" onClick={() => removeOptionRaw(i)} className="hover:text-destructive transition-colors">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleAddQuestion} type="button" className="w-full py-2.5 rounded-xl border-2 border-dashed border-border/20 text-muted-foreground font-bold text-sm hover:bg-secondary/20 hover:text-foreground hover:border-border/30 transition-all flex items-center justify-center gap-2">
                                        <Plus size={16} /> Add to List
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end mt-8 gap-3">
                                <button type="button" onClick={() => setActiveSection('details')} className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs font-bold px-6 py-2.5 rounded-full hover:from-primary/30 hover:to-secondary/30 hover:text-foreground hover:shadow-glow transition-all border border-border/10"
                                >
                                    Publish Job
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CreateJobPage;
