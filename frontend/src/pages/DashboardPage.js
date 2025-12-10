import React, { useState, useEffect } from 'react';
import { getDashboardStats, getApplications } from '../services/api';

const DashboardPage = () => {
    const navigate = React.useRef(null);
    // Safe navigation if using generic wrapper, but here we can import useNavigate
    // Let's use window.location for simplicity if hooks are tricky in replace, but DashboardPage is a component so useNavigate is fine.
    // However, I need to check if I can add imports. 
    // Wait, I can't easily add 'useNavigate' import at top of file with replace_file if I only target this block.
    // I already imported React, { useState, useEffect } in the file.
    // I should check if I can use <a href> or if I need to do a full file replace to add hook.
    // Actually, I can just use <Link> if I import it, or window.location.
    // Let's assume I can add <a href="/admin/jobs/create">. 

    // Better: let's just make the button an anchor tag styled as button.

    const [stats, setStats] = useState({ total_candidates: 0, today_candidates: 0, status_breakdown: [] });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const statsData = await getDashboardStats();
            const appsData = await getApplications();
            setStats(statsData);
            setApplications(appsData);
            setLoading(false);
        };
        loadData();
    }, []);

    const getScoreColor = (score) => {
        if (!score) return 'bg-gray-100 text-gray-800';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-indigo-600">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">ScreenAI Dashboard</h1>
                    <div className="flex gap-4">
                        <a href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2">Home</a>
                        <a href="/admin/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Post Job</a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_candidates}</dd>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Applied Today</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">{stats.today_candidates}</dd>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Screened Candidates</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">
                            {stats.status_breakdown.find(s => s.status === 'SCREENED')?.count || 0}
                        </dd>
                    </div>
                </div>

                {/* Candidate Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Search candidates..." className="border rounded-md px-3 py-1 text-sm text-gray-600" />
                        </div>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {applications.map((app) => (
                            <li key={app.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {app.candidate_details.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-indigo-600 truncate">{app.candidate_details.name}</div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="truncate">{app.job_title}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(app.ai_match_score)}`}>
                                                Match: {app.ai_match_score ? `${app.ai_match_score}%` : 'Pending'}
                                            </span>
                                            <p className="mt-1 text-xs text-gray-400">{new Date(app.applied_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {app.ai_summary && (
                                        <div className="mt-2 pl-14">
                                            <p className="text-sm text-gray-600 italic">"{app.ai_summary}"</p>
                                            {app.ai_missing_skills && app.ai_missing_skills.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {app.ai_missing_skills.map((skill, idx) => (
                                                        <span key={idx} className="bg-red-50 text-red-600 text-xs px-1.5 py-0.5 rounded border border-red-100">{skill}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
