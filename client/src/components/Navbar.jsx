import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="logo">TaskMate</div>

      <nav>
        <Link to="/">Home</Link>

        {/* 👇 ROLE BASED UI */}
        {token && role === "user" && (
          <Link to="/post-task">Post Task</Link>
        )}

        {token && role === "helper" && (
          <Link to="/browse">Browse Tasks</Link>
        )}

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">
              <button className="register-btn">Register</button>
            </Link>
          </>
        ) : (
          <button className="register-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;