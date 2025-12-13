import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobDetail, getJobApplications } from '../services/api';

const JobCandidatesPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPlatform, setFilterPlatform] = useState('All');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [jobData, appsData] = await Promise.all([
                    getJobDetail(jobId),
                    getJobApplications(jobId)
                ]);
                setJob(jobData);
                setCandidates(appsData);
            } catch (err) {
                console.error("Error loading data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [jobId]);

    const copyLink = (platform) => {
        let link = `${window.location.origin}/jobs/${jobId}/apply?platform=${platform}`;
        navigator.clipboard.writeText(link);
        alert(`Copied ${platform} link: ` + link);
    };

    const filteredCandidates = candidates.filter(app => {
        const matchesSearch = app.candidate_details.name.toLowerCase().includes(search.toLowerCase()) ||
            app.candidate_details.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
        const matchesPlatform = filterPlatform === 'All' || (app.platform || 'Website').toLowerCase() === filterPlatform.toLowerCase();

        return matchesSearch && matchesStatus && matchesPlatform;
    });

    const getScoreColor = (score) => {
        if (!score) return 'bg-gray-100 text-gray-800';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Candidates...</div>;
    if (!job) return <div className="p-8 text-center text-red-500">Job not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4">
                        <Link to="/admin/jobs" className="text-gray-500 hover:text-gray-700">← Back to Jobs</Link>
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    </div>
                    <p className="mt-2 text-gray-600 ml-24">Candidates & Platform Analytics</p>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">Engineering • Remote • {candidates.length} candidates</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => copyLink('linkedin')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">LinkedIn</button>
                            <button onClick={() => copyLink('indeed')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">Indeed</button>
                            <button onClick={() => copyLink('glassdoor')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">Glassdoor</button>
                            <button onClick={() => copyLink('naukri')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">Naukri</button>
                            <a href={`/jobs/${job.id}/apply`} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">Preview Form ↗</a>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600" onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="NEW">New</option>
                            <option value="SCREENED">Screened</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600" onChange={(e) => setFilterPlatform(e.target.value)}>
                            <option value="All">All Platforms</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Indeed">Indeed</option>
                            <option value="Naukri">Naukri</option>
                            <option value="Glassdoor">Glassdoor</option>
                            <option value="Website">Website</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCandidates.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {app.candidate_details.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{app.candidate_details.name}</div>
                                                <div className="text-sm text-gray-500">{app.candidate_details.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(app.applied_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit bg-blue-50 text-blue-700 border border-blue-100">
                                                {app.platform || 'Website'}
                                            </span>
                                            {app.platform && app.platform.toLowerCase() === 'linkedin' && app.candidate_details.linkedin_url && (
                                                <a href={app.candidate_details.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1">
                                                    View Profile ↗
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(app.ai_match_score)}`}>
                                            {app.ai_match_score ? `${app.ai_match_score}%` : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                        {app.status.replace('_', ' ').toLowerCase()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCandidates.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No candidates found for this job yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default JobCandidatesPage;
