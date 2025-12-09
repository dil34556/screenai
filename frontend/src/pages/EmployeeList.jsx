import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  const loadEmployees = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:8000/api/auth/employee/list/",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEmployees(res.data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:8000/api/auth/employee/delete/${id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Employee deleted");
    loadEmployees();
  };

  return (
    <div style={{ width: "320px", margin: "60px auto" }}>
      <h2>Employee List</h2>

      {employees.map((emp) => (
        <div
          key={emp.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>{emp.email}</p>
          <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default EmployeeList;
