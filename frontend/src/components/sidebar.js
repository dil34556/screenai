import React from "react";
import "./sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">HR Portal</h2>

      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/create">Create Employee</a></li>
        <li><a href="/view">View Employees</a></li>
        <li><a href="/analytics">Analytics</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
