import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
// import API from "../api/auth"; // when you call backend

const Dashboard = () => {
  // Example dummy data; later fetch from backend
  const stats = {
    totalJobs: 8,
    totalApplicants: 120,
    shortlisted: 25,
    rejected: 30,
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar />
        <div style={styles.content}>
          <h2>Dashboard</h2>
          <p>Overview of your job postings and applicants</p>

          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>Total Jobs</h3>
              <p>{stats.totalJobs}</p>
            </div>
            <div style={styles.card}>
              <h3>Total Applicants</h3>
              <p>{stats.totalApplicants}</p>
            </div>
            <div style={styles.card}>
              <h3>Shortlisted</h3>
              <p>{stats.shortlisted}</p>
            </div>
            <div style={styles.card}>
              <h3>Rejected</h3>
              <p>{stats.rejected}</p>
            </div>
          </div>

          {/* Later: add tables/graphs for "Applicants per Job", "HR Activity" etc. */}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: "1.5rem",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  card: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.03)",
  },
};

export default Dashboard;
