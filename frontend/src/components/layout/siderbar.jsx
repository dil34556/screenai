import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const linkStyle = (path) => ({
    padding: "0.75rem 1rem",
    display: "block",
    textDecoration: "none",
    color: location.pathname === path ? "#fff" : "#e5e7eb",
    background: location.pathname === path ? "#1d4ed8" : "transparent",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  });

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>ATS Admin</h2>
      <nav>
        <Link to="/" style={linkStyle("/")}>
          Dashboard
        </Link>
        <Link to="/jobs" style={linkStyle("/jobs")}>
          Jobs
        </Link>
        <Link to="/applicants" style={linkStyle("/applicants")}>
          Applicants
        </Link>
        <Link to="/hr-activity" style={linkStyle("/hr-activity")}>
          HR Activity
        </Link>
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    background: "#111827",
    color: "#e5e7eb",
    padding: "1.5rem 1rem",
    minHeight: "100vh",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.3rem",
  },
};

export default Sidebar;
