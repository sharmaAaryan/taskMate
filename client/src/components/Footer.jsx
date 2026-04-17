import { Link } from "react-router-dom";

function Footer() {
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
          <Link to="/browse">Browse Tasks</Link>
          <Link to="/post-task">Post Task</Link>
        </div>

        {/* Account */}
        <div className="footer-section">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
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