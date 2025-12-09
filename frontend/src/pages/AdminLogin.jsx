import React, { useState } from "react";
import axios from "axios";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);
      alert("Login successful!");
      window.location.href = "/dashboard";

    } catch (error) {
      alert("Invalid login credentials");
    }
  };

  return (
    <div style={{ marginTop: "120px", textAlign: "center" }}>
      <h2>Admin Login</h2>

      <form onSubmit={login} style={{ width: "300px", margin: "auto" }}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <button
          type="submit"
          style={{ width: "100%", padding: "10px" }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
