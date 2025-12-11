import React from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Analytics({ onBack }) {
  // Weekly Trend Data
  const weeklyData = [
    { week: "Week 1", applications: 45, hired: 2 },
    { week: "Week 2", applications: 60, hired: 2 },
    { week: "Week 3", applications: 72, hired: 3 },
    { week: "Week 4", applications: 89, hired: 4 },
  ];

  // Pipeline Distribution
  const pipelineData = [
    { stage: "New", count: 80 },
    { stage: "Screening", count: 140 },
    { stage: "Shortlisted", count: 110 },
    { stage: "Interview", count: 60 },
    { stage: "Hired", count: 30 },
    { stage: "Rejected", count: 50 },
  ];

  // Daily Applications
  const dailyData = [
    { day: "Mon", value: 22 },
    { day: "Tue", value: 18 },
    { day: "Wed", value: 33 },
    { day: "Thu", value: 27 },
    { day: "Fri", value: 14 },
    { day: "Sat", value: 9 },
    { day: "Sun", value: 6 },
  ];

  // Platform Performance (Donut)
  const platformData = [
    { name: "LinkedIn", value: 156 },
    { name: "Indeed", value: 98 },
    { name: "Company Website", value: 78 },
    { name: "Glassdoor", value: 56 },
    { name: "Referral", value: 54 },
    { name: "Naukri", value: 45 },
    { name: "Monster", value: 32 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#cc33ff", "#0099cc", "#ff6666"];

  // HR Team Performance
  const hrTeam = [
    { name: "Sarah Johnson", calls: 12, shortlisted: 8, rejected: 15, hired: 3, conversion: 12 },
    { name: "Mike Chen", calls: 8, shortlisted: 6, rejected: 10, hired: 2, conversion: 11 },
    { name: "Emily Davis", calls: 15, shortlisted: 12, rejected: 8, hired: 5, conversion: 20 },
    { name: "James Wilson", calls: 10, shortlisted: 7, rejected: 12, hired: 4, conversion: 17 },
    { name: "Lisa Brown", calls: 6, shortlisted: 4, rejected: 9, hired: 1, conversion: 7 },
    { name: "David Martinez", calls: 9, shortlisted: 5, rejected: 7, hired: 2, conversion: 14 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-10" style={{ marginLeft: "300px" }}>


          <button
            onClick={onBack}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">Analytics</h1>
          <p className="text-gray-600 mb-8">Detailed recruitment metrics and insights</p>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600 font-medium">Total Applications</p>
              <h2 className="text-4xl font-bold text-blue-600 mt-2">10</h2>
              <p className="text-green-600 text-sm mt-1">+23% vs last month</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600 font-medium">Hired This Month</p>
              <h2 className="text-4xl font-bold text-green-600 mt-2">1</h2>
              <p className="text-green-600 text-sm">On track</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600 font-medium">Total Calls Today</p>
              <h2 className="text-4xl font-bold text-blue-600 mt-2">60</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600 font-medium">Conversion Rate</p>
              <h2 className="text-4xl font-bold text-purple-600 mt-2">10%</h2>
              <p className="text-green-600 text-sm">+2% improvement</p>
            </div>

          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

            {/* Weekly Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Weekly Application Trend</h2>

              <LineChart width={450} height={250} data={weeklyData}>
                <Line type="monotone" dataKey="applications" stroke="#007BFF" strokeWidth={3} />
                <Line type="monotone" dataKey="hired" stroke="#22c55e" strokeWidth={3} />
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </div>

            {/* Pipeline Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Pipeline Status Distribution</h2>

              <BarChart width={450} height={250} data={pipelineData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" />
                <Bar dataKey="count" fill="#1d4ed8" />
                <Tooltip />
              </BarChart>
            </div>
          </div>

          {/* SECOND ROW OF CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

            {/* Daily Applications Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Daily Applications</h2>

              <BarChart width={450} height={250} data={dailyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </div>

            {/* Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>

              <PieChart width={450} height={250}>
                <Pie
                  data={platformData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label
                >
                  {platformData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* HR TEAM PERFORMANCE */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6">HR Team Performance</h2>

            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">HR Name</th>
                  <th className="p-3 text-left">Calls Today</th>
                  <th className="p-3 text-left">Shortlisted</th>
                  <th className="p-3 text-left">Rejected</th>
                  <th className="p-3 text-left">Hired</th>
                  <th className="p-3 text-left">Conversion</th>
                </tr>
              </thead>

              <tbody>
                {hrTeam.map((hr, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">{hr.name}</td>
                    <td className="p-3">{hr.calls}</td>
                    <td className="p-3 text-yellow-600 font-semibold">{hr.shortlisted}</td>
                    <td className="p-3 text-red-600 font-semibold">{hr.rejected}</td>
                    <td className="p-3 text-green-600 font-semibold">{hr.hired}</td>
                    <td className="p-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${hr.conversion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 ml-2">{hr.conversion}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
