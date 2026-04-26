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
  const [showUserMenu, setShowUserMenu] = useState(false);
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

        {/* 👑 ADMIN */}
        {token && role === "admin" && (
          <>
            <Link to="/admin-dashboard">Admin Dashboard</Link>
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

        {/* LOGOUT & WIDGETS */}
        {token && (
          <div className="nav-right">
            


            {/* Account Dropdown */}
            {role !== "admin" && (
              <div className="notification-wrapper">
                  <div className="user-menu-trigger" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "8px 15px", background: "#f8f9ff", borderRadius: "20px", fontWeight: "600", color: "#334155", position: "relative" }}
                >
                  <span>Account ▾</span>
                  {role === "user" && unreadCount > 0 && (
                    <span style={{ background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "11px", position: "absolute", top: "-5px", right: "-5px" }}>{unreadCount}</span>
                  )}
                </div>

                {showUserMenu && (
                  <div className="notification-dropdown" style={{ right: 0, minWidth: "200px", padding: "10px" }}>
                    {walletBalance !== null && (
                      <div style={{ padding: "10px", borderBottom: "1px solid #eee", marginBottom: "5px" }}>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>Available Balance</span>
                        <br />
                        <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "16px" }}>💳 ₹{walletBalance}</span>
                      </div>
                    )}
                    
                    <Link to="/profile" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => setShowUserMenu(false)}>👤 Profile</Link>
                    <Link to="/transactions" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => setShowUserMenu(false)}>📜 Transactions</Link>
                    <Link to="/support" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => setShowUserMenu(false)}>🎧 Support / Complaints</Link>

                    {/* Notifications Section */}
                    {role === "user" && (
                      <div style={{ padding: "10px", borderTop: "1px solid #eee", marginTop: "5px" }}>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>🔔 Notifications</span>
                        {notifications.length === 0 ? (
                          <p style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>No notifications yet.</p>
                        ) : (
                          <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {notifications.map((n) => (
                              <div 
                                key={n._id} 
                                onClick={() => markAsRead(n._id)}
                                style={{ padding: "8px", background: n.isRead ? "#f8f9fa" : "#eef2ff", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                              >
                                <p style={{ margin: 0, color: n.isRead ? "#555" : "#111", fontWeight: n.isRead ? "normal" : "600" }}>{n.message}</p>
                                <span style={{ fontSize: "11px", color: "#888" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button onClick={handleLogout} className="register-btn" style={{ marginLeft: "15px" }}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;