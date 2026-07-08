import { useAuth } from "../context/AuthContext";

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo-text">NotesHub</div>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search notes by title or tag..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

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
