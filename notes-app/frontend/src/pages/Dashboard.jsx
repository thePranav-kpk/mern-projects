import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Notes Dashboard</h1>
      <p>
        Welcome, <strong>{user?.name}</strong>! You are logged in.
      </p>
      <button
        onClick={logout}
        className="btn"
        style={{ marginTop: "1rem", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
