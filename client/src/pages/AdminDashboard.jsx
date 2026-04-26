import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchAdminData = async () => {
      if (role !== "admin") return;
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats"),
          fetch("http://localhost:5000/api/complaints")
        ]);
        
        const statsData = await statsRes.json();
        const complaintsData = await complaintsRes.json();
        
        setStats(statsData);
        setComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [role, refresh]);

  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, { method: "PUT" });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject and delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reject`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleResolveComplaint = async (complaintId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  if (role !== "admin") {
    return <div className="text-center mt-15" style={{ fontSize: "20px", fontWeight: "bold" }}>Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header-flex">
        <h2 className="dashboard-title">🛡️ Admin Dashboard</h2>
      </div>

      {loading ? (
        <p className="no-task">Loading admin stats...</p>
      ) : stats ? (
        <>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <h3>Total Money in Escrow (System Hold)</h3>
              <p className="stat-value highlight">₹{stats.totalEscrow}</p>
              <span className="stat-desc">Held safely until tasks complete</span>
            </div>
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <p className="stat-value">{stats.totalTasks}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <h3 className="mt-15 mb-10" style={{ fontSize: "22px" }}>Pending User Approvals</h3>
          <div className="transaction-table-wrapper mb-20">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.filter(u => !u.isApproved && u.role !== "admin").map((user) => (
                  <tr key={user._id}>
                    <td className="tx-desc">{user.name}</td>
                    <td className="tx-user">📧 {user.email}</td>
                    <td>
                      <span className="status-badge pending">{user.role}</span>
                    </td>
                    <td>
                      <button className="accept-btn" style={{ marginRight: '10px' }} onClick={() => handleApprove(user._id)}>Approve</button>
                      <button className="reject-btn" onClick={() => handleReject(user._id)}>Reject</button>
                    </td>
                  </tr>
                ))}
                {stats.users.filter(u => !u.isApproved && u.role !== "admin").length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No users pending approval.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="mt-15 mb-10" style={{ fontSize: "22px" }}>User Complaints</h3>
          <div className="transaction-table-wrapper mb-20">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Subject & Details</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td className="tx-date">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="tx-user">👤 {c.user?.name} ({c.user?.role})</td>
                    <td>
                      <strong>{c.subject}</strong>
                      <p className="text-muted" style={{ fontSize: "13px", marginTop: "4px" }}>{c.description}</p>
                    </td>
                    <td>
                      <span className={`status-badge ${c.status === "open" ? "rejected" : c.status === "resolved" ? "accepted" : "pending"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === "open" && (
                        <>
                          <button className="accept-btn" style={{ marginRight: '10px' }} onClick={() => handleResolveComplaint(c._id, "resolved")}>Resolve</button>
                          <button className="reject-btn" onClick={() => handleResolveComplaint(c._id, "dismissed")}>Dismiss</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No complaints filed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="mt-15 mb-10" style={{ fontSize: "22px" }}>Platform Tasks</h3>
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Client</th>
                  <th>Volunteer</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="tx-desc">{task.title}</td>
                    <td className="tx-user">👤 {task.createdBy?.name || "Unknown"}</td>
                    <td className="tx-user">
                      {task.selectedVolunteer ? `👤 ${task.selectedVolunteer.name}` : "-"}
                    </td>
                    <td className="tx-amount">₹{task.budget}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          task.status === "completed" ? "accepted" : task.status === "in-progress" ? "pending" : ""
                        }`}
                      >
                        {task.status || "open"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="no-task">Failed to load stats.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
