import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginApi(username, password);
      // Expecting: { access: "token", user: {...} }
      login(data.user, data.access);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>ATS Admin Login</h2>
        <p>Login to manage job postings and applicants</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  form: { marginTop: "1rem" },
  field: { marginBottom: "1rem", display: "flex", flexDirection: "column" },
  input: {
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  button: {
    width: "100%",
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: { color: "red", marginBottom: "0.5rem" },
};

export default Login;
