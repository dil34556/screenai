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
            // Handle pagination: if results exist, use them, otherwise use data directly
            setApplications(appsData.results || appsData);
            setStats(statsData);
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
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>⚡ Action Center</span>
                        </h3>
                        <div className="space-y-3">
                            <Link to="/admin/applications?status=NEW" className="flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-blue-900 group-hover:text-blue-700">Pending Reviews</p>
                                    <p className="text-xs text-blue-600">New applications to screen</p>
                                </div>
                                <span className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                                    {stats.status_breakdown.find(s => s.status === 'NEW')?.count || 0}
                                </span>
                            </Link>

                            <Link to="/admin/applications?status=SCREENED" className="flex justify-between items-center p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-indigo-900 group-hover:text-indigo-700">Screened Candidates</p>
                                    <p className="text-xs text-indigo-600">Ready for interview scheduling</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                                    {stats.status_breakdown.find(s => s.status === 'SCREENED')?.count || 0}
                                </span>
                            </Link>

                            <Link to="/admin/applications?status=INTERVIEW" className="flex justify-between items-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-purple-900 group-hover:text-purple-700">Interviews</p>
                                    <p className="text-xs text-purple-600">Active interview rounds</p>
                                </div>
                                <span className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                                    {stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* 2. Hiring Funnel */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 lg:col-span-2 border border-gray-100 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-8">Hiring Funnel</h3>
                        <div className="relative flex items-center justify-between px-4 sm:px-10">
                            {/* Pipeline Line */}
                            <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -z-0 -translate-y-4"></div>

                            {['NEW', 'SCREENED', 'INTERVIEW', 'OFFER'].map((stage, index) => {
                                const count = stats.status_breakdown.find(s => s.status === stage)?.count || 0;
                                const labels = { 'NEW': 'Applied', 'SCREENED': 'Screened', 'INTERVIEW': 'Interview', 'OFFER': 'Offer' };
                                const subLabels = { 'NEW': 'Total Pool', 'SCREENED': 'Qualified', 'INTERVIEW': 'In-Progress', 'OFFER': 'Hired' };
                                const colors = { 'NEW': 'bg-blue-500', 'SCREENED': 'bg-indigo-500', 'INTERVIEW': 'bg-purple-500', 'OFFER': 'bg-green-500' };
                                const ringColors = { 'NEW': 'ring-blue-100', 'SCREENED': 'ring-indigo-100', 'INTERVIEW': 'ring-purple-100', 'OFFER': 'ring-green-100' };

                                return (
                                    <div key={stage} className="relative z-10 flex flex-col items-center group">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${colors[stage]} mb-3 ring-4 ${ringColors[stage]} transition-transform group-hover:scale-110`}>
                                            {count}
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{labels[stage]}</span>
                                        <span className="text-xs text-gray-400 mt-1">{subLabels[stage]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legacy Stats (Secondary) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 shadow-sm rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <dt className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Candidates</dt>
                        <dd className="text-3xl font-bold text-gray-900">{stats.total_candidates}</dd>
                    </div>
                    <div className="bg-white p-5 shadow-sm rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <dt className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Applied Today</dt>
                        <dd className="text-3xl font-bold text-indigo-600">{stats.today_candidates}</dd>
                    </div>
                </div>

                {/* Candidate Table */}
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-100">
                    <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-gray-100">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">Recent Applications</h3>
                        <div className="relative">
                            {/* SVG Search Icon */}
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                            />
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
                                            <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full 
                                                ${app.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                                                    app.status === 'SCREENED' ? 'bg-indigo-100 text-indigo-800' :
                                                        app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-800' :
                                                            app.status === 'OFFER' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'}`}>
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
