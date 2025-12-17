import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState({});
  const [weekly, setWeekly] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [daily, setDaily] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [hrTeam, setHrTeam] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        ov,
        wk,
        pipelineRes,
        dailyRes,
        platformRes,
        hrRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/analytics/overview/`),
        axios.get(`${API_BASE}/analytics/weekly/`),
        axios.get(`${API_BASE}/analytics/pipeline/`),
        axios.get(`${API_BASE}/analytics/daily/`),
        axios.get(`${API_BASE}/analytics/platforms/`),
        axios.get(`${API_BASE}/analytics/hr_team/`),
      ]);

      setOverview(ov.data);
      setWeekly(wk.data);

      setPipeline(
        Object.keys(pipelineRes.data).map((key) => ({
          name: key,
          value: pipelineRes.data[key],
        }))
      );

      setDaily(dailyRes.data);
      setPlatforms(platformRes.data);
      setHrTeam(hrRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const colors = [
    "#2563EB", "#0EA5E9", "#10B981", "#F59E0B",
    "#EF4444", "#6366F1", "#8B5CF6"
  ];

  return (
    <div style={{ padding: "30px" }}>
      {/* ANALYTICS HEADER */}
      <h2 style={{ marginBottom: "5px" }}>Analytics</h2>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Detailed recruitment metrics and insights
      </p>

      {/* KPI CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
      }}>
        <KPI title="Total Applications" value={overview.total_applications} subtitle="+23% vs last month" />
        <KPI title="Hired This Month" value={overview.hired_this_month} subtitle="On track" />
        <KPI title="Total Calls Today" value={overview.total_calls_today} />
        <KPI title="Conversion Rate" value={`${overview.conversion_rate}%`} subtitle="+2% improvement" />
      </div>

      <br />

      {/* WEEKLY TREND + PIPELINE ROW */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* WEEKLY TREND */}
        <div style={cardStyle}>
          <h4>Weekly Application Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIPELINE STATUS */}
        <div style={cardStyle}>
          <h4>Pipeline Status Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipeline} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <br />

      {/* DAILY APPLICATIONS + PLATFORM PERFORMANCE */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* DAILY APPLICATIONS */}
        <div style={cardStyle}>
          <h4>Daily Applications</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PLATFORM PERFORMANCE */}
        <div style={cardStyle}>
          <h4>Platform Performance</h4>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={platforms}
                  dataKey="count"
                  nameKey="platform"
                  innerRadius={40}
                  outerRadius={80}
                >
                  {platforms.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div>
              {platforms.map((p, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      display: "inline-block",
                      background: colors[i % colors.length],
                      marginRight: "10px",
                    }}
                  ></span>
                  {p.platform} — <strong>{p.count}</strong> ({p.conversion}% conv)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* HR TEAM PERFORMANCE */}
      <div style={cardStyle}>
        <h4>HR Team Performance</h4>

        <table className="analytics-table">
          <thead>
            <tr>
              <th>HR Name</th>
              <th>Calls Today</th>
              <th>Shortlisted</th>
              <th>Rejected</th>
              <th>Hired</th>
              <th>Conversion</th>
            </tr>
          </thead>

          <tbody>
            {hrTeam.map((hr, i) => (
              <tr key={i}>
                <td>{hr.name}</td>
                <td>{hr.calls_today}</td>
                <td><Badge color="orange">{hr.shortlisted}</Badge></td>
                <td><Badge color="red">{hr.rejected}</Badge></td>
                <td><Badge color="green">{hr.hired}</Badge></td>
                <td>{hr.conversion}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KPI({ title, value, subtitle }) {
  return (
    <div style={cardStyle}>
      <p style={{ color: "gray", marginBottom: "5px" }}>{title}</p>
      <h2>{value}</h2>
      <p style={{ color: "#10B981" }}>{subtitle}</p>
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span
      style={{
        background: color,
        padding: "5px 12px",
        color: "white",
        borderRadius: "12px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  flex: 1,
};
