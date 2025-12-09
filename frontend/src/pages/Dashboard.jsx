import React from "react";

function Dashboard() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Admin Dashboard</h1>

      <a href="/employee/create">
        <button style={{ padding: "10px 20px", margin: "10px" }}>
          Create Employee
        </button>
      </a>

      <a href="/employee/list">
        <button style={{ padding: "10px 20px", margin: "10px" }}>
          View Employees
        </button>
      </a>
    </div>
  );
}

export default Dashboard;
