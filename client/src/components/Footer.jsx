import { Link } from "react-router-dom";

function Footer() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-section brand">
          <h2>TaskMate</h2>
          <p>
            Get help. Give help. Get paid.  
            A platform connecting clients and skilled volunteers.
          </p>

          <div className="socials">
            <span>🌐</span>
            <span>💼</span>
            <span>📧</span>
          </div>
        </div>

        {/* Links */}
        <div className="footer-section">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          {token && role === "user" && (
            <>
              <Link to="/client-dashboard">My Dashboard</Link>
              <Link to="/post-task">Post a Task</Link>
            </>
          )}
          {token && role === "helper" && (
            <>
              <Link to="/volunteer-dashboard">My Dashboard</Link>
              <Link to="/browse">Browse Tasks</Link>
            </>
          )}
          {token && role === "admin" && (
            <Link to="/admin-dashboard">Admin Dashboard</Link>
          )}
        </div>

        {/* Account / Support */}
        <div className="footer-section">
          <h4>{token ? "Helpful Links" : "Account"}</h4>
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              {role !== "admin" && <Link to="/profile">My Profile</Link>}
              {role !== "admin" && <Link to="/transactions">Transaction History</Link>}
              <Link to="/support">Support & Complaints</Link>
            </>
          )}
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 sharmaishu573@gmail.com</p>
          <p>📞 +91 8091753794</p>
          <p>📍 India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 TaskMate • Built with ❤️</p>
      </div>
    </footer>
  );
}

export default Footer;