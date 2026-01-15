import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

function EmployeeAnalysis() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'individual'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/analytics/')
            .then(res => res.json())
            .then(data => {
                if (data.hr_team_performance) {
                    setEmployees(data.hr_team_performance);
                    calculateDashboardStats(data.hr_team_performance);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching analytics:", err);
                setLoading(false);
            });
    }, []);

    const calculateDashboardStats = (emps) => {
        // Aggregate Data
        const totals = emps.reduce((acc, curr) => ({
            new: acc.new + (curr.new || 0),
            screened: acc.screened + (curr.screened || 0),
            interviewed: acc.interviewed + (curr.interviewed || 0),
            offered: acc.offered + (curr.offered || 0),
            rejected: acc.rejected + (curr.rejected || 0),
        }), { new: 0, screened: 0, interviewed: 0, offered: 0, rejected: 0 });

        // Calculate conversion for aggregate
        const totalDecisions = totals.screened + totals.interviewed + totals.offered + totals.rejected;
        const totalProcessed = totalDecisions > 0 ? totalDecisions : 1;
        totals.conversion = ((totals.offered / totalProcessed) * 100).toFixed(1);

        setDashboardStats(totals);
    };

    useEffect(() => {
        if (selectedEmployeeId) {
            const data = employees.find(e => e.email === selectedEmployeeId);
            setSelectedEmployeeData(data);
        } else {
            setSelectedEmployeeData(null);
        }
    }, [selectedEmployeeId, employees]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500">Loading analysis data...</div>
            </div>
        );
    }

    const renderStatsCards = (data) => (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">New Candidates</div>
                <div className="text-2xl font-bold text-slate-800">{data.new}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Screened</div>
                <div className="text-2xl font-bold text-indigo-600">{data.screened}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Interviewed</div>
                <div className="text-2xl font-bold text-purple-600">{data.interviewed}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Offers / Hired</div>
                <div className="text-2xl font-bold text-emerald-600">{data.offered}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Rejected</div>
                <div className="text-2xl font-bold text-red-500">{data.rejected}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-3 lg:col-span-5 flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">Overall Success Rate</div>
                    <div className="text-sm text-slate-400">Offers vs Total Decisions</div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{data.conversion}%</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {viewMode === 'dashboard' ? 'Recruitment Dashboard' : 'Individual Performance'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {viewMode === 'dashboard' ? 'Organization-wide recruitment metrics' : 'Detailed analysis per employee'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {viewMode === 'individual' && (
                            <button
                                onClick={() => {
                                    setViewMode('dashboard');
                                    setSelectedEmployeeId('');
                                }}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm flex items-center gap-2"
                            >
                                <span>←</span> Dashboard
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-sm text-slate-400 hover:text-indigo-600 transition-colors self-center ml-2"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                {viewMode === 'dashboard' && dashboardStats && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderStatsCards(dashboardStats)}

                        {/* Individual Performance Filter */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Individual Performance</h3>
                                    <p className="text-sm text-slate-500">Select an employee to view their detailed metrics</p>
                                </div>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="block w-full md:w-72 rounded-lg border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">-- All Employees --</option>
                                    {employees.map((emp, index) => (
                                        <option key={index} value={emp.email}>
                                            {emp.name} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Show selected employee stats */}
                            {selectedEmployeeData && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-800">{selectedEmployeeData.new || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">New</div>
                                        </div>
                                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                            <div className="text-2xl font-bold text-indigo-600">{selectedEmployeeData.screened || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Screened</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{selectedEmployeeData.interviewed || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Interviewed</div>
                                        </div>
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-600">{selectedEmployeeData.offered || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Hired</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 rounded-lg">
                                            <div className="text-2xl font-bold text-red-500">{selectedEmployeeData.rejected || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Rejected</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-sm text-slate-500">Success Rate: </span>
                                        <span className="text-lg font-bold text-slate-900">{selectedEmployeeData.conversion || 0}%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team List Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800">Team Performance Breakdown</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Employee Name</th>
                                            <th className="px-6 py-4">Screened</th>
                                            <th className="px-6 py-4">Interviewed</th>
                                            <th className="px-6 py-4">Hired/Offer</th>
                                            <th className="px-6 py-4">Rejected</th>
                                            <th className="px-6 py-4">Success Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {employees.map((emp, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {emp.name}
                                                    <span className="block text-xs text-slate-400 font-normal">{emp.email}</span>
                                                </td>
                                                <td className="px-6 py-4">{emp.screened}</td>
                                                <td className="px-6 py-4">{emp.interviewed}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-medium">{emp.offered}</td>
                                                <td className="px-6 py-4 text-red-500 font-medium">{emp.rejected}</td>
                                                <td className="px-6 py-4">{emp.conversion}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Comparison Charts */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Activity Volume</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={employees} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="screened" name="Screened" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="interviewed" name="Interviewed" fill="#9333ea" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Hiring Success</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={employees} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="offered" name="Offers Made" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="rejected" name="Rejected" fill="#ef4444" barSize={20} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>



                        <div className="flex justify-end">
                            <button
                                onClick={() => setViewMode('individual')}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold flex items-center gap-2 group"
                            >
                                View Individual Performance
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'individual' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* Selection Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Employee
                            </label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">-- Choose an employee --</option>
                                {employees.map((emp, index) => (
                                    <option key={index} value={emp.email}>
                                        {emp.name} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEmployeeData ? (
                            <div className="space-y-8">
                                {renderStatsCards(selectedEmployeeData)}

                                {/* Individual Graph */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] border-l-4 border-l-indigo-500">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend: {selectedEmployeeData.name}</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={[
                                                { stage: 'New', count: selectedEmployeeData.new },
                                                { stage: 'Screened', count: selectedEmployeeData.screened },
                                                { stage: 'Interviewed', count: selectedEmployeeData.interviewed },
                                                { stage: 'Offered', count: selectedEmployeeData.offered },
                                                { stage: 'Rejected', count: selectedEmployeeData.rejected },
                                            ]}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="stage" />
                                            <YAxis />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#4f46e5" fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                <p className="text-slate-400">Select an employee from the list to view their detailed performance report.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default EmployeeAnalysis;
