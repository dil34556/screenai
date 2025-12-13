import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        job_type: 'ONSITE',
        required_skills: '',
        description: ''
    });

    const [questions, setQuestions] = useState([]);

    // Detailed Question State
    const [currentQ, setCurrentQ] = useState({
        question: '',
        type: 'short_text', // short_text, long_text, dropdown, multiple_choice
        options: [], // For dropdown/multiple_choice
        required: false
    });

    // Temp state for adding an option to the current question
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

        // Validation: Options required for certain types
        if (['dropdown', 'multiple_choice'].includes(currentQ.type) && currentQ.options.length === 0) {
            alert('Please add at least one option for this question type.');
            return;
        }

        setQuestions([...questions, { ...currentQ, id: Date.now() }]);
        // Reset
        setCurrentQ({ question: '', type: 'short_text', options: [], required: false });
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
                screening_questions: questions
            };

            await axios.post('http://127.0.0.1:8000/api/v1/jobs/', payload);
            alert('Job Posted Successfully!');
            navigate('/admin/jobs');
        } catch (error) {
            console.error(error);
            alert('Failed to post job.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Create Job Posting</h1>

                <form className="space-y-8" onSubmit={handleSubmit}>

                    {/* Section 1: Basic Information */}
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                                <p className="mt-1 text-sm text-gray-500">Key details about the role.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                                    <input type="text" name="title" required onChange={handleChange} placeholder="e.g. Senior Frontend Developer" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                                    <input type="text" name="department" required onChange={handleChange} placeholder="Select department (e.g. Engineering)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location *</label>
                                        <input type="text" name="location" required onChange={handleChange} placeholder="e.g. Remote, New York" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Job Type *</label>
                                        <select name="job_type" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                            <option value="ONSITE">On-site</option>
                                            <option value="REMOTE">Remote</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                                    <input type="text" name="required_skills" placeholder="Python, React, AWS (Comma separated)" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Job Description */}
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Job Description</h3>
                                <p className="mt-1 text-sm text-gray-500">Describe the role, responsibilities, and requirements.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                <textarea name="description" rows={8} required onChange={handleChange} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md" placeholder="Enter full job description..." />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Application Questions */}
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Application Questions</h3>
                                <p className="mt-1 text-sm text-gray-500">Add custom questions for candidates to answer.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">

                                {/* List of Added Questions */}
                                {questions.length > 0 ? (
                                    <ul className="space-y-3">
                                        {questions.map((q, idx) => (
                                            <li key={idx} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                                                <div className="pr-10">
                                                    <p className="font-bold text-gray-900">{q.question} {q.required && <span className="text-red-500">*</span>}</p>
                                                    <p className="text-xs text-gray-500 uppercase mt-1">{q.type.replace('_', ' ')}</p>

                                                    {['dropdown', 'multiple_choice'].includes(q.type) && (
                                                        <ul className="mt-2 pl-4 list-disc text-sm text-gray-600">
                                                            {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                                                        </ul>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => handleRemoveQuestion(idx)} className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-sm font-medium">
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500">No custom questions created yet.</p>
                                    </div>
                                )}

                                {/* Question Builder */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Add New Question</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Question Text</label>
                                            <input
                                                type="text"
                                                value={currentQ.question}
                                                onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
                                                placeholder="e.g. What is your expected salary?"
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-1/2">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
                                                <select
                                                    value={currentQ.type}
                                                    onChange={(e) => setCurrentQ({ ...currentQ, type: e.target.value, options: [] })}
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="short_text">Short Text</option>
                                                    <option value="long_text">Long Text</option>
                                                    <option value="dropdown">Dropdown</option>
                                                    <option value="multiple_choice">Multiple Choice</option>
                                                </select>
                                            </div>
                                            <div className="w-1/2 flex items-center pt-6">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentQ.required}
                                                        onChange={(e) => setCurrentQ({ ...currentQ, required: e.target.checked })}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm text-gray-900">Required Field</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Options Builder for Choice Types */}
                                        {['dropdown', 'multiple_choice'].includes(currentQ.type) && (
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Options</label>

                                                <ul className="mb-2 space-y-1">
                                                    {currentQ.options.map((opt, i) => (
                                                        <li key={i} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded">
                                                            <span>{opt}</span>
                                                            <button type="button" onClick={() => removeOptionRaw(i)} className="text-red-500 hover:text-red-700">×</button>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newOption}
                                                        onChange={(e) => setNewOption(e.target.value)}
                                                        placeholder="Add an option (e.g. Remote)"
                                                        className="flex-1 border border-gray-300 rounded-md py-1 px-2 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addOptionRaw}
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleAddQuestion}
                                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
                                        >
                                            Add Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" onClick={() => navigate('/admin/jobs')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
                            Cancel
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Create Job Posting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobPage;
