import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobDetail, getJobApplications, updateJob } from '../services/api';

const JobCandidatesPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPlatform, setFilterPlatform] = useState('All');

    // Custom platform modal states
    const [showCustomPlatformModal, setShowCustomPlatformModal] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');
    const [savingPlatform, setSavingPlatform] = useState(false);

    // Default platforms
    const defaultPlatforms = ['linkedin', 'indeed', 'glassdoor', 'naukri'];

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

    // Get all platforms including custom ones
    const getAllPlatforms = () => {
        const customPlatforms = job?.custom_platforms || [];
        return [...defaultPlatforms, ...customPlatforms];
    };

    const copyLink = (platform) => {
        let link = `${window.location.origin}/jobs/${jobId}/apply?platform=${platform}`;
        navigator.clipboard.writeText(link);
        alert(`Copied ${platform} link: ` + link);
    };

    const goToJob = (platform) => {
        const link = `${window.location.origin}/jobs/${jobId}/apply?platform=${platform}`;
        window.open(link, '_blank');
    };

    // Add custom platform and save to DB
    const handleAddCustomPlatform = async () => {
        if (!newPlatformName.trim()) return;

        const platformName = newPlatformName.trim().toLowerCase();
        const currentCustomPlatforms = job?.custom_platforms || [];

        // Check if platform already exists
        if (getAllPlatforms().includes(platformName)) {
            alert('This platform already exists!');
            return;
        }

        setSavingPlatform(true);
        try {
            const updatedPlatforms = [...currentCustomPlatforms, platformName];
            await updateJob(jobId, { custom_platforms: updatedPlatforms });

            // Update local state
            setJob(prev => ({ ...prev, custom_platforms: updatedPlatforms }));
            setNewPlatformName('');
            setShowCustomPlatformModal(false);
        } catch (err) {
            console.error('Error saving custom platform:', err);
            alert('Failed to save custom platform. Please try again.');
        } finally {
            setSavingPlatform(false);
        }
    };

    // Remove custom platform
    const handleRemoveCustomPlatform = async (platformToRemove) => {
        if (!window.confirm(`Remove "${platformToRemove}" platform?`)) return;

        const currentCustomPlatforms = job?.custom_platforms || [];
        const updatedPlatforms = currentCustomPlatforms.filter(p => p !== platformToRemove);

        try {
            await updateJob(jobId, { custom_platforms: updatedPlatforms });
            setJob(prev => ({ ...prev, custom_platforms: updatedPlatforms }));
        } catch (err) {
            console.error('Error removing custom platform:', err);
            alert('Failed to remove custom platform. Please try again.');
        }
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

    // Get platform button styling
    const getPlatformStyle = (platform) => {
        const styles = {
            linkedin: 'bg-blue-600 hover:bg-blue-700 text-white',
            indeed: 'bg-blue-800 hover:bg-blue-900 text-white',
            glassdoor: 'bg-green-600 hover:bg-green-700 text-white',
            naukri: 'bg-purple-600 hover:bg-purple-700 text-white',
        };
        return styles[platform] || 'bg-gray-600 hover:bg-gray-700 text-white';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Candidates...</div>;
    if (!job) return <div className="p-8 text-center text-red-500">Job not found</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            {/* Custom Platform Modal */}
            {showCustomPlatformModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Custom Platform</h3>
                        <input
                            type="text"
                            placeholder="Enter platform name (e.g., Monster, CareerBuilder)"
                            value={newPlatformName}
                            onChange={(e) => setNewPlatformName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPlatform()}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowCustomPlatformModal(false); setNewPlatformName(''); }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustomPlatform}
                                disabled={savingPlatform || !newPlatformName.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                            >
                                {savingPlatform ? 'Saving...' : 'Add Platform'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4">
                        <Link to="/admin/jobs" className="text-muted-foreground hover:text-foreground">← Back to Jobs</Link>
                        <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
                    </div>
                    <p className="mt-2 text-muted-foreground ml-24">Candidates & Platform Analytics</p>
                </div>
            </div>

            {/* Apply via Platform Section */}
            <div className="max-w-7xl mx-auto mb-6 bg-card shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-semibold text-foreground">Apply via Platform:</h3>
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Default Platform Buttons */}
                        <button
                            onClick={() => goToJob('linkedin')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            LinkedIn
                        </button>
                        <button
                            onClick={() => goToJob('indeed')}
                            className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
                        >
                            <span className="font-bold">In</span> Indeed
                        </button>
                        <button
                            onClick={() => goToJob('glassdoor')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
                        >
                            <span className="font-bold">Gd</span> Glassdoor
                        </button>
                        <button
                            onClick={() => goToJob('naukri')}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
                        >
                            <span className="font-bold">Nk</span> Naukri
                        </button>

                        {/* Custom Platform Buttons */}
                        {(job?.custom_platforms || []).map((platform) => (
                            <div key={platform} className="relative group">
                                <button
                                    onClick={() => goToJob(platform)}
                                    className={`px-4 py-2 ${getPlatformStyle(platform)} rounded-md font-medium capitalize transition-colors`}
                                >
                                    {platform}
                                </button>
                                <button
                                    onClick={() => handleRemoveCustomPlatform(platform)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Remove platform"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* Add Custom Platform Button */}
                        <button
                            onClick={() => setShowCustomPlatformModal(true)}
                            className="px-4 py-2 border-2 border-dashed border-gray-400 hover:border-indigo-500 text-gray-600 hover:text-indigo-600 rounded-md font-medium flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Custom
                        </button>
                    </div>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="max-w-7xl mx-auto bg-card shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-secondary/20 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{job.department || 'Engineering'} • {job.location} • {candidates.length} candidates</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => copyLink('linkedin')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2" title="Copy LinkedIn link">
                                📋 LinkedIn
                            </button>
                            <button onClick={() => copyLink('indeed')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2" title="Copy Indeed link">
                                📋 Indeed
                            </button>
                            <button onClick={() => copyLink('glassdoor')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2" title="Copy Glassdoor link">
                                📋 Glassdoor
                            </button>
                            <button onClick={() => copyLink('naukri')} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2" title="Copy Naukri link">
                                📋 Naukri
                            </button>
                            {/* Copy links for custom platforms */}
                            {(job?.custom_platforms || []).map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => copyLink(platform)}
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 capitalize"
                                    title={`Copy ${platform} link`}
                                >
                                    📋 {platform}
                                </button>
                            ))}
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
                            <option value="HIRED">Hired</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600" onChange={(e) => setFilterPlatform(e.target.value)}>
                            <option value="All">All Platforms</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Indeed">Indeed</option>
                            <option value="Naukri">Naukri</option>
                            <option value="Glassdoor">Glassdoor</option>
                            <option value="Website">Website</option>
                            {/* Custom platforms in filter */}
                            {(job?.custom_platforms || []).map((platform) => (
                                <option key={platform} value={platform} className="capitalize">{platform}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border/10">
                            {filteredCandidates.map((app) => (
                                <tr key={app.id} className="hover:bg-secondary/20 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {app.candidate_details.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-foreground">{app.candidate_details.name}</div>
                                                <div className="text-sm text-muted-foreground">{app.candidate_details.email}</div>
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
                                        <div className="flex items-center gap-2">
                                            <button className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                href={`/jobs/${jobId}/apply?platform=${app.platform || 'website'}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                                title="Go to Job Application Form"
                                            >
                                                Go to Job ↗
                                            </a>
                                        </div>
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
