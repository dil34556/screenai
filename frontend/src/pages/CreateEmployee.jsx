import React, { useState } from "react";
import axios from "axios";

function CreateEmployee() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createEmployee = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/auth/employee/create/",
        { email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Employee created!");
      setEmail("");
      setPassword("");

    } catch (error) {
      alert("Error creating employee");
    }
  };

  return (
    <div style={{ marginTop: "80px", textAlign: "center" }}>
      <h2>Create Employee</h2>

      <form onSubmit={createEmployee} style={{ width: "300px", margin: "auto" }}>
        <input
          type="email"
          placeholder="Employee Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <input
          type="password"
          placeholder="Employee Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateEmployee;
