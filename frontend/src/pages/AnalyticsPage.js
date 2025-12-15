import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Phone, Target } from 'lucide-react';

import axios from 'axios';

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/v1/analytics/');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-indigo-600 text-lg">Loading Analytics...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-600">Failed to load analytics data</div>
            </div>
        );
    }

    const { summary, weekly_trend, pipeline_distribution, daily_applications, platform_performance, hr_team_performance } = data;

    // Calculate max values for chart scaling
    const maxWeeklyApps = Math.max(...weekly_trend.map(w => w.applications), 1);
    const maxDailyApps = Math.max(...daily_applications.map(d => d.count), 1);
    const maxPipeline = Math.max(...pipeline_distribution.map(p => p.count), 1);

    // Status label mapping
    const statusLabels = {
        'NEW': 'New',
        'SCREENED': 'Screening',
        'INTERVIEW': 'Interview',
        'OFFER': 'Hired',
        'REJECTED': 'Rejected'
    };

    // Platform colors
    const platformColors = {
        'LINKEDIN': '#0077B5',
        'INDEED': '#2164F3',
        'GLASSDOOR': '#0CAA41',
        'NAUKRI': '#EF4136',
        'OTHER': '#6B7280',
        'Website': '#8B5CF6'
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Detailed recruitment metrics and insights</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Applications</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_applications}</p>
                            <p className="text-xs text-green-600 mt-2">+23% vs last month</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Hired This Month</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.hired_this_month}</p>
                            <p className="text-xs text-green-600 mt-2">On track</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <Target className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Calls Today</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_calls_today}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Phone className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.conversion_rate}%</p>
                            <p className="text-xs text-green-600 mt-2">+2% improvement</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-indigo-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Application Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Application Trend</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {weekly_trend.map((week, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex flex-col items-center gap-2 mb-2">
                                    {/* Applications bar */}
                                    <div
                                        className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 relative group"
                                        style={{ height: `${(week.applications / maxWeeklyApps) * 200}px`, minHeight: '4px' }}
                                    >
                                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {week.applications}
                                        </span>
                                    </div>
                                    {/* Hired bar */}
                                    <div
                                        className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600 relative group"
                                        style={{ height: `${(week.hired / maxWeeklyApps) * 100}px`, minHeight: '2px' }}
                                    >
                                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {week.hired}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-600 font-medium mt-2">{week.week}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-xs text-gray-600">applications</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-xs text-gray-600">hired</span>
                        </div>
                    </div>
                </div>

                {/* Pipeline Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline Status Distribution</h3>
                    <div className="space-y-4">
                        {pipeline_distribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700 w-24">{statusLabels[item.status] || item.status}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                                        style={{ width: `${(item.count / maxPipeline) * 100}%` }}
                                    >
                                        <span className="text-xs font-bold text-white">{item.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Second Row of Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Daily Applications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Applications</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {daily_applications.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 relative group"
                                    style={{ height: `${(day.count / maxDailyApps) * 200}px`, minHeight: '4px' }}
                                >
                                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {day.count}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-600 font-medium mt-2">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Performance */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Performance</h3>
                    <div className="flex items-center justify-center mb-6">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {platform_performance.map((platform, index) => {
                                const total = platform_performance.reduce((sum, p) => sum + p.count, 0);
                                let startAngle = platform_performance.slice(0, index).reduce((sum, p) => sum + (p.count / total) * 360, 0);
                                const angle = (platform.count / total) * 360;
                                const endAngle = startAngle + angle;

                                const startRad = (startAngle - 90) * Math.PI / 180;
                                const endRad = (endAngle - 90) * Math.PI / 180;

                                const x1 = 100 + 70 * Math.cos(startRad);
                                const y1 = 100 + 70 * Math.sin(startRad);
                                const x2 = 100 + 70 * Math.cos(endRad);
                                const y2 = 100 + 70 * Math.sin(endRad);

                                const largeArc = angle > 180 ? 1 : 0;

                                const pathData = [
                                    `M 100 100`,
                                    `L ${x1} ${y1}`,
                                    `A 70 70 0 ${largeArc} 1 ${x2} ${y2}`,
                                    `Z`
                                ].join(' ');

                                return (
                                    <path
                                        key={index}
                                        d={pathData}
                                        fill={platformColors[platform.platform] || platformColors['OTHER']}
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                );
                            })}
                            <circle cx="100" cy="100" r="40" fill="white" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        {platform_performance.map((platform, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: platformColors[platform.platform] || platformColors['OTHER'] }}
                                    ></div>
                                    <span className="text-sm text-gray-700">{platform.platform}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-900">{platform.count}</span>
                                    <span className="text-xs text-gray-500">({platform.percentage}% conv)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HR Team Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">HR Team Performance</h3>
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary'
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('detailed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'detailed'
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Detailed
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">HR Name</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Calls Today</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Shortlisted</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hired</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Conversion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {hr_team_performance.map((hr, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                {hr.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{hr.name}</p>
                                                <p className="text-xs text-gray-500">{hr.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                                            {hr.calls_today}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-bold">
                                            {hr.shortlisted}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 text-sm font-bold">
                                            {hr.rejected}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                                            {hr.hired}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${hr.conversion}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{hr.conversion}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
