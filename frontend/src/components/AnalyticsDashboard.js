import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Phone,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award
} from "lucide-react";
import { getAnalyticsData } from "../services/api";

// Google Data Viz Colors
const COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#AB47BC", "#00ACC1"];


// ... imports remain the same, ensuring Lucide icons are imported ...
function KPICard({ title, value, icon: Icon, trend, trendUp, color, onClick }) {
  const iconColors = {
    indigo: "text-[#4B90FF]",
    indigo: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div
      onClick={onClick}
      className={`m3-card flex flex-col justify-between h-[150px] group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100`}>
          <Icon size={24} className={iconColors[color]} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${trendUp ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10 mt-4 flex items-baseline gap-3">
        <h3 className="text-4xl font-heading font-medium text-foreground tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('4w'); // Default 4 weeks

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Poll slower (30s)
    return () => clearInterval(interval);
  }, [timeRange]); // Re-fetch on timeRange change

  const fetchAnalytics = async () => {
    try {
      const result = await getAnalyticsData({ range: timeRange });
      setData(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-transparent">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-transparent text-muted-foreground">
      <p className="mb-4 text-lg font-medium">{error}</p>
      <button
        onClick={fetchAnalytics}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition active:scale-95"
      >
        Retry
      </button>
    </div>
  );

  const { summary, weekly_trend, pipeline_distribution, platform_performance, hr_team_performance } = data || {};

  // Google Data Viz Colors (Neon Adjusted)
  const COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#AB47BC", "#00ACC1"];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-transparent p-6 md:p-8 font-sans text-foreground pb-20 selection:bg-primary-container selection:text-primary-onContainer transition-colors duration-200">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-10">
        <h1 className="text-4xl font-heading font-normal text-foreground tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2 font-normal text-lg">Real-time insights into your recruitment pipeline and team performance.</p>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Job Roles"
            value={summary?.total_jobs || 0}
            icon={Briefcase}
            color="indigo"
            onClick={() => navigate('/admin/jobs')}
          />
          <KPICard
            title="Total Candidates"
            value={summary?.total_applications || 0}
            icon={Users}
            color="indigo"
            onClick={() => navigate('/admin/applications')}
          />
          <KPICard
            title="Persons Hired"
            value={summary?.total_hired || 0}
            icon={Award}
            color="green"
            onClick={() => navigate('/admin/applications?status=HIRED')}
          />
          <KPICard
            title="Rejected"
            value={summary?.rejected_count || 0}
            icon={TrendingDown}
            color="purple"
            onClick={() => navigate('/admin/applications?status=REJECTED')}
          />

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="m3-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-foreground">Application Trend</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none bg-gray-100 text-xs font-bold text-gray-700 pl-4 pr-8 py-2 rounded-full outline-none hover:bg-gray-200 transition-colors cursor-pointer border-none"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="4w">Last 4 Weeks</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly_trend}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E3E7" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#444746', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444746', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E7', borderRadius: '8px', color: '#000', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#000' }}
                    cursor={{ stroke: '#4285F4', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#4285F4" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="m3-card">
            <h3 className="text-lg font-medium text-foreground mb-8">Pipeline Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline_distribution} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} stroke="transparent" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="status"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {pipeline_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
