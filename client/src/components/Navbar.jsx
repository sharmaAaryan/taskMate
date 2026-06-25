import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchNotificationsAndWallet = async () => {
      try {
        const [notifRes, userRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications/${userId}`),
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/users/${userId}`)
        ]);
        
        const notifData = await notifRes.json();
        const userData = await userRes.json();
        
        setNotifications(notifData);
        setWalletBalance(userData.walletBalance);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchNotificationsAndWallet();
    const interval = setInterval(fetchNotificationsAndWallet, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [token, userId]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications/${id}/read`, {
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
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>TaskMate</div>

      {/* ☰ Hamburger Menu Button */}
      <button 
        className="menu-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation"
      >
        ☰
      </button>

      <nav className={mobileMenuOpen ? "active" : ""}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>

        {/* 👤 CLIENT */}
        {token && role === "user" && (
          <>
            <Link to="/client-dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/post-task" onClick={() => setMobileMenuOpen(false)}>Post Task</Link>
          </>
        )}

        {/* 🤝 VOLUNTEER */}
        {token && role === "helper" && (
          <>
            <Link to="/volunteer-dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)}>Browse Tasks</Link>
          </>
        )}

        {/* 👑 ADMIN */}
        {token && role === "admin" && (
          <>
            <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
          </>
        )}

        {/* NOT LOGGED IN */}
        {!token && (
          <>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <button className="register-btn">Register</button>
            </Link>
          </>
        )}

        {/* LOGOUT & WIDGETS */}
        {token && (
          <div className="nav-right">
            


            {/* Account Dropdown */}
            <div className="notification-wrapper">
                <div className="user-menu-trigger" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "8px 15px", background: "#f8f9ff", borderRadius: "20px", fontWeight: "600", color: "#334155", position: "relative" }}
              >
                <span>Account ▾</span>
                {role !== "admin" && unreadCount > 0 && (
                  <span style={{ background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "11px", position: "absolute", top: "-5px", right: "-5px" }}>{unreadCount}</span>
                )}
              </div>

              {showUserMenu && (
                <div className="notification-dropdown" style={{ right: 0, minWidth: "200px", padding: "10px", zIndex: 1000, position: "absolute", background: "white", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", top: "100%", marginTop: "10px" }}>
                  <div 
                    onClick={() => { setDarkMode(!darkMode); setShowUserMenu(false); setMobileMenuOpen(false); }} 
                    style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", cursor: "pointer", transition: "0.2s", borderBottom: role !== "admin" ? "1px solid #eee" : "none", marginBottom: "5px" }}
                  >
                    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </div>

                  {role !== "admin" && walletBalance !== null && (
                    <div style={{ padding: "10px", borderBottom: "1px solid #eee", marginBottom: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>Available Balance</span>
                          <br />
                          <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "16px" }}>💳 ₹{walletBalance}</span>
                        </div>
                        {role === "user" && (
                          <button 
                            onClick={() => {
                              const amount = prompt("Enter amount to add to wallet (INR):");
                              if (amount && !isNaN(amount) && Number(amount) > 0) {
                                fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/users/${userId}/add-funds`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ amount: Number(amount) })
                                })
                                .then(res => res.json())
                                .then(data => {
                                  if (data.walletBalance !== undefined) {
                                    setWalletBalance(data.walletBalance);
                                    alert("Funds added successfully!");
                                  }
                                })
                                .catch(err => console.error("Error adding funds", err));
                              }
                            }}
                            style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", cursor: "pointer" }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {role !== "admin" && (
                    <>
                      <Link to="/profile" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => { setShowUserMenu(false); setMobileMenuOpen(false); }}>👤 Profile</Link>
                      <Link to="/transactions" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => { setShowUserMenu(false); setMobileMenuOpen(false); }}>📜 Transactions</Link>
                      <Link to="/support" style={{ display: "block", padding: "10px", color: "#334155", textDecoration: "none", transition: "0.2s" }} onClick={() => { setShowUserMenu(false); setMobileMenuOpen(false); }}>🎧 Support / Complaints</Link>
                    </>
                  )}

                    {/* Notifications Section */}
                    {role !== "admin" && (
                      <div style={{ padding: "10px", borderTop: "1px solid #eee", marginTop: "5px" }}>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>🔔 Notifications</span>
                        {notifications.length === 0 ? (
                          <p style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>No notifications yet.</p>
                        ) : (
                          <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {notifications.map((n) => (
                              <div 
                                key={n._id} 
                                onClick={() => { markAsRead(n._id); setMobileMenuOpen(false); }}
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