import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="logo">TaskMate</div>

      <nav>
        <Link to="/">Home</Link>

        {/* 👤 CLIENT */}
        {token && role === "user" && (
          <>
            <Link to="/client-dashboard">Dashboard</Link>
            <Link to="/post-task">Post Task</Link> {/* ✅ NEW */}
          </>
        )}

        {/* 🤝 VOLUNTEER */}
        {token && role === "helper" && (
          <>
            <Link to="/volunteer-dashboard">Dashboard</Link>
            <Link to="/browse">Browse Tasks</Link>
          </>
        )}

        {/* NOT LOGGED IN */}
        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">
              <button className="register-btn">Register</button>
            </Link>
          </>
        )}

        {/* LOGOUT */}
        {token && (
          <button onClick={handleLogout} className="register-btn">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;