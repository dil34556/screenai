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
    green: "text-[#00E676]",
    blue: "text-[#4B90FF]",
    purple: "text-[#D946EF]",
  };

  const bgColors = {
    indigo: "bg-[#4B90FF]/10 border-[#4B90FF]/20",
    green: "bg-[#00E676]/10 border-[#00E676]/20",
    blue: "bg-[#4B90FF]/10 border-[#4B90FF]/20",
    purple: "bg-[#D946EF]/10 border-[#D946EF]/20",
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-6 flex flex-col justify-between h-[150px] group hover:bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow relative overflow-hidden rounded-[24px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Glow Effect */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity bg-primary/20`} />

      <div className="flex justify-between items-start relative z-10">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/30 backdrop-blur-md`}>
          <Icon size={22} className={iconColors[color]} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted/10 text-muted-foreground border-border/10'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-4xl font-heading font-light text-foreground tracking-tight mb-1">{value}</h3>
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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await getAnalyticsData();
      setData(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-background text-muted-foreground">
      <p className="mb-4 text-lg font-medium">{error}</p>
      <button
        onClick={fetchAnalytics}
        className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition"
      >
        Retry
      </button>
    </div>
  );

  const { summary, weekly_trend, pipeline_distribution, platform_performance, hr_team_performance } = data || {};

  // Google Data Viz Colors (Neon Adjusted)
  const COLORS = ["#4B90FF", "#FF55D2", "#F4B400", "#00E676", "#D946EF", "#00ACC1"];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans text-foreground pb-20 selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl font-heading font-light text-foreground tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2 font-light text-lg">Real-time insights into your recruitment pipeline and team performance.</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <KPICard
            title="Total Applications"
            value={summary?.total_applications || 0}
            icon={Users}
            trend="+12%"
            trendUp={true}
            color="indigo"
            onClick={() => navigate('/admin/applications')}
          />
          <KPICard
            title="Hired This Month"
            value={summary?.hired_this_month || 0}
            icon={Award}
            trend="On Track"
            trendUp={true}
            color="green"
            onClick={() => navigate('/admin/applications?status=OFFER')}
          />

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="glass-panel p-8 rounded-[24px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-foreground">Application Trend</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border/10">
                <Calendar size={14} /> Last 4 Weeks
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly_trend}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B90FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4B90FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    cursor={{ stroke: '#4B90FF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#4B90FF" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="glass-panel p-8 rounded-[24px]">
            <h3 className="text-lg font-bold text-foreground mb-8">Pipeline Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline_distribution} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.3} />
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
