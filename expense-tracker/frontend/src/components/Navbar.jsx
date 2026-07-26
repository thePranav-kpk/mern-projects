import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo-text">ExpenseTracker</div>

      <div className="nav-right">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
