import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getApplications } from '../services/api';

const DashboardPage = () => {

    const [stats, setStats] = useState({ total_candidates: 0, today_candidates: 0, status_breakdown: [] });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const statsData = await getDashboardStats();
                const appsData = await getApplications();
                // Handle pagination: if results exist, use them, otherwise use data directly
                setApplications(appsData.results || appsData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                // Optional: set an error state here to show to user
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen text-indigo-600">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">ScreenAI Dashboard</h1>
                <div className="flex gap-4">
                    <span className="text-gray-500 self-center">Home</span>
                    <Link to="/admin/jobs/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        Post Job
                    </Link>
                </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Action Center */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="text-orange-500">⚡</span> Action Center
                    </h3>
                    <div className="space-y-4">
                        <Link to="/admin/applications?status=NEW" className="block p-4 bg-blue-50 bg-opacity-50 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-blue-900">Pending Reviews</p>
                                    <p className="text-xs text-blue-600 mt-1">New applications to screen</p>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">{stats.status_breakdown.find(s => s.status === 'NEW')?.count || 0}</span>
                            </div>
                        </Link>
                        <Link to="/admin/applications?status=SCREENED" className="block p-4 bg-indigo-50 bg-opacity-50 rounded-lg border-l-4 border-indigo-500 hover:bg-indigo-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-indigo-900">Screened Candidates</p>
                                    <p className="text-xs text-indigo-600 mt-1">Ready for interview scheduling</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600">{stats.status_breakdown.find(s => s.status === 'SCREENED')?.count || 0}</span>
                            </div>
                        </Link>
                        <Link to="/admin/applications?status=INTERVIEW" className="block p-4 bg-purple-50 bg-opacity-50 rounded-lg border-l-4 border-purple-500 hover:bg-purple-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-purple-900">Interviews</p>
                                    <p className="text-xs text-purple-600 mt-1">Active interview rounds</p>
                                </div>
                                <span className="text-2xl font-bold text-purple-600">{stats.status_breakdown.find(s => s.status === 'INTERVIEW')?.count || 0}</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Hiring Funnel */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-8">Hiring Funnel</h3>
                    <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-6 -z-0"></div>
                        {['NEW', 'SCREENED', 'INTERVIEW', 'OFFER'].map((stage) => {
                            const count = stats.status_breakdown.find(s => s.status === stage)?.count || 0;
                            const labels = { 'NEW': 'Applied', 'SCREENED': 'Screened', 'INTERVIEW': 'Interview', 'OFFER': 'Hired' };
                            const subLabels = { 'NEW': 'Total Pool', 'SCREENED': 'Qualified', 'INTERVIEW': 'In-Progress', 'OFFER': 'Hired' };
                            const colors = { 'NEW': 'bg-blue-500', 'SCREENED': 'bg-indigo-500', 'INTERVIEW': 'bg-purple-500', 'OFFER': 'bg-green-500' };
                            const ringColors = { 'NEW': 'ring-blue-100', 'SCREENED': 'ring-indigo-100', 'INTERVIEW': 'ring-purple-100', 'OFFER': 'ring-green-100' };

                            return (
                                <div key={stage} className="relative z-10 flex flex-col items-center group cursor-default">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-lg ${colors[stage]} ring-4 ${ringColors[stage]} transition-transform group-hover:scale-110`}>
                                        {count}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-900 text-sm">{labels[stage]}</p>
                                        <p className="text-xs text-gray-400 mt-1">{subLabels[stage]}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legacy Stats Row (Total Candidates) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Candidates</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.total_candidates}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applied Today</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.today_candidates}</p>
                </div>
            </div>

            {/* Recent Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Applications</h3>
                    <div className="relative">
                        <input type="text" placeholder="Search candidates..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div>
                    <ul className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <li key={app.id} className="hover:bg-gray-50 transition-colors">
                                <div className="p-4 px-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {app.candidate_details.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{app.candidate_details.name}</p>
                                            <p className="text-xs text-gray-500">{app.job_title}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                app.status === 'SCREENED' ? 'bg-indigo-100 text-indigo-700' :
                                                    app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
