import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                {/* Top Statistics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* 1. Action Center */}
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-indigo-500">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <span>⚡ Action Center</span>
                        </h3>
                        <div className="space-y-4">
                            <Link to="/admin/applications?status=NEW" className="flex justify-between items-center p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Pending Reviews</p>
                                    <p className="text-xs text-gray-500">New applications to screen</p>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">
                                    {stats.status_breakdown.find(s => s.status === 'NEW')?.count || 0}
                                </span>
                            </Link>

                            <Link to="/admin/applications?status=SCREENED" className="flex justify-between items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100 transition cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Screened Candidates</p>
                                    <p className="text-xs text-gray-500">Ready for interview scheduling</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {stats.status_breakdown.find(s => s.status === 'SCREENED')?.count || 0}
                                </span>
                            </Link>

                            <Link to="/admin/applications?status=INTERVIEW" className="flex justify-between items-center p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Interviews</p>
                                    <p className="text-xs text-gray-500">Active interview rounds</p>
                                </div>
                                <span className="text-2xl font-bold text-purple-600">
                                    {stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* 2. Hiring Funnel */}
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 lg:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Hiring Funnel</h3>
                        <div className="relative flex items-center justify-between pt-6 pb-2">
                            {/* Pipeline Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>

                            {['NEW', 'SCREENED', 'INTERVIEW', 'OFFER'].map((stage, index) => {
                                const count = stats.status_breakdown.find(s => s.status === stage)?.count || 0;
                                const labels = { 'NEW': 'Applied', 'SCREENED': 'Screened', 'INTERVIEW': 'Interview', 'OFFER': 'Offer' };
                                const colors = { 'NEW': 'bg-blue-500', 'SCREENED': 'bg-indigo-500', 'INTERVIEW': 'bg-purple-500', 'OFFER': 'bg-green-500' };

                                return (
                                    <div key={stage} className="relative z-10 flex flex-col items-center bg-white px-2">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${colors[stage]} mb-2`}>
                                            {count}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{labels[stage]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 grid grid-cols-4 gap-4 text-center text-xs text-gray-400">
                            <div>Total Pool</div>
                            <div>Qualified</div>
                            <div>In-Progress</div>
                            <div>Hired</div>
                        </div>
                    </div>
                </div>

                {/* Legacy Stats (Optional / Secondary) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 shadow rounded-lg text-center">
                        <dt className="text-xs text-gray-500 uppercase">Total Candidates</dt>
                        <dd className="text-xl font-semibold text-gray-900">{stats.total_candidates}</dd>
                    </div>
                    <div className="bg-white p-4 shadow rounded-lg text-center">
                        <dt className="text-xs text-gray-500 uppercase">Applied Today</dt>
                        <dd className="text-xl font-semibold text-indigo-600">{stats.today_candidates}</dd>
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
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'NEW' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {app.status}
                                            </span>
                                            <p className="mt-1 text-xs text-gray-400">{new Date(app.applied_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
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
