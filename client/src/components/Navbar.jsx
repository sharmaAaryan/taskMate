import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchNotificationsAndWallet = async () => {
      try {
        const [notifRes, userRes] = await Promise.all([
          fetch(`http://localhost:5000/api/notifications/${userId}`),
          fetch(`http://localhost:5000/api/users/${userId}`)
        ]);
        
        const notifData = await notifRes.json();
        const userData = await userRes.json();
        
        setNotifications(notifData);
        setWalletBalance(userData.walletBalance);
      } catch (error) {
        console.error("Failed to fetch data");
      }
    };

    fetchNotificationsAndWallet();
    const interval = setInterval(fetchNotificationsAndWallet, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [token, userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="navbar">
      <div className="logo">TaskMate</div>

      <nav>
        <Link to="/">Home</Link>

        {/* 👤 CLIENT */}
        {token && role === "user" && (
          <>
            <Link to="/client-dashboard">Dashboard</Link>
            <Link to="/post-task">Post Task</Link>
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

        {/* LOGOUT & PROFILE & NOTIFICATIONS */}
        {token && (
          <div className="nav-right">
            
            {/* 💰 Wallet Balance */}
            {walletBalance !== null && (
              <div className="wallet-badge">
                💳 ₹{walletBalance}
              </div>
            )}

            {/* 🔔 Notifications Bell (CLIENT ONLY) */}
            {role === "user" && (
              <div className="notification-wrapper">
                <div 
                  className="notification-bell" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  🔔
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </div>

                {showDropdown && (
                  <div className="notification-dropdown">
                    <h4>Notifications</h4>
                    {notifications.length === 0 ? (
                      <p className="no-notifs">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          className={`notif-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => markAsRead(n._id)}
                        >
                          <p>{n.message}</p>
                          <span className="notif-time">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <Link to="/profile" className="profile-link">Profile</Link>
            <button onClick={handleLogout} className="register-btn">
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;