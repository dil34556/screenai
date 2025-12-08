import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.topbar}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
        Applicant Tracking System
      </h1>
      <div style={styles.right}>
        <span style={{ marginRight: "1rem" }}>
          {user ? `Logged in as: ${user.username}` : ""}
        </span>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  topbar: {
    height: "60px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    background: "#fff",
  },
  right: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },
};

export default Topbar;
