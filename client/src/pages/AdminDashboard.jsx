import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showEscrowDetails, setShowEscrowDetails] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
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
  const handleUnblock = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/unblock`, { method: "PUT" });
      const data = await res.json();
      if(res.ok) {
        alert("User unblocked successfully!");
        setRefresh((prev) => prev + 1);
      } else {
        alert(data.message);
      }
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
            <div 
              className="stat-card"
              onClick={() => setShowEscrowDetails(true)} 
              style={{ cursor: "pointer", border: "1px solid transparent", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(139, 92, 246, 0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)"; }}
            >
              <h3>Total Money in Escrow (System Hold)</h3>
              <p className="stat-value highlight" style={{ color: "#8b5cf6" }}>₹{stats.totalEscrow}</p>
              <span className="stat-desc" style={{ color: "#8b5cf6", fontWeight: "500", marginTop: "8px", display: "inline-block" }}>
                View escrow breakdown &rarr;
              </span>
            </div>
            <div 
              className="stat-card"
              onClick={() => setShowAllTasks(true)} 
              style={{ cursor: "pointer", border: "1px solid transparent", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(16, 185, 129, 0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)"; }}
            >
              <h3>Total Tasks</h3>
              <p className="stat-value">{stats.totalTasks}</p>
              <span className="stat-desc" style={{ color: "#10b981", fontWeight: "500", marginTop: "8px", display: "inline-block" }}>
                View all tasks &rarr;
              </span>
            </div>
            <div 
              className="stat-card" 
              onClick={() => setShowAllUsers(true)} 
              style={{ cursor: "pointer", border: "1px solid transparent", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(14, 165, 233, 0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)"; }}
            >
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
              <span className="stat-desc" style={{ color: "#0ea5e9", fontWeight: "500", marginTop: "8px", display: "inline-block" }}>
                Click to view details &rarr;
              </span>
            </div>
          </div>

          {showEscrowDetails && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
              <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px' }}>🔐</span> Escrow Details (In-Progress Tasks)
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Detailed breakdown of funds currently held by the system</p>
                  </div>
                  <button onClick={() => setShowEscrowDetails(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                    &times;
                  </button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  <table className="transaction-table" style={{ margin: 0, width: '100%' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Task Title</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Client (From)</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Volunteer (To)</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Escrow Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.tasks.filter(t => t.status === "in-progress").map((task) => (
                        <tr key={task._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px', fontSize: '15px' }}>{task.title}</div>
                            <div style={{ color: '#64748b', fontSize: '12px' }}>ID: {task._id}</div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>👤</span>
                              <div>
                                <div style={{ fontWeight: '500', color: '#1e293b' }}>{task.createdBy?.name || "Unknown"}</div>
                                <div style={{ color: '#64748b', fontSize: '12px' }}>{task.createdBy?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>👷‍♂️</span>
                              <div>
                                <div style={{ fontWeight: '500', color: '#1e293b' }}>{task.selectedVolunteer?.name || "Unknown"}</div>
                                <div style={{ color: '#64748b', fontSize: '12px' }}>{task.selectedVolunteer?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: '700', color: '#8b5cf6', fontSize: '16px' }}>
                            ₹{task.budget}
                          </td>
                        </tr>
                      ))}
                      {stats.tasks.filter(t => t.status === "in-progress").length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center" style={{ padding: '40px', color: '#64748b' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💸</div>
                            No money currently held in escrow.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showAllTasks && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
              <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px' }}>📋</span> All Platform Tasks
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Comprehensive list of all tasks created on the platform</p>
                  </div>
                  <button onClick={() => setShowAllTasks(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                    &times;
                  </button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  <table className="transaction-table" style={{ margin: 0, width: '100%' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Task Details</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Client (Posted By)</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Volunteer (Assigned To)</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.tasks.map((task) => (
                        <tr key={task._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px', fontSize: '15px' }}>{task.title}</div>
                            <div style={{ color: '#64748b', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>👤</span>
                              <div>
                                <div style={{ fontWeight: '500', color: '#1e293b' }}>{task.createdBy?.name || "Unknown"}</div>
                                <div style={{ color: '#64748b', fontSize: '12px' }}>{task.createdBy?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            {task.selectedVolunteer ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>👷‍♂️</span>
                                <div>
                                  <div style={{ fontWeight: '500', color: '#1e293b' }}>{task.selectedVolunteer?.name}</div>
                                  <div style={{ color: '#64748b', fontSize: '12px' }}>{task.selectedVolunteer?.email}</div>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#fef3c7' : '#e0f2fe',
                              color: task.status === 'completed' ? '#166534' : task.status === 'in-progress' ? '#92400e' : '#0369a1',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {task.status || "open"}
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: '700', color: '#10b981', fontSize: '16px' }}>
                            ₹{task.budget}
                          </td>
                        </tr>
                      ))}
                      {stats.tasks.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center" style={{ padding: '40px', color: '#64748b' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                            No tasks have been created yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showAllUsers && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
              <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px' }}>🌐</span> All Registered Users
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Comprehensive list of all users on the platform</p>
                  </div>
                  <button onClick={() => setShowAllUsers(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                    &times;
                  </button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                  <table className="transaction-table" style={{ margin: 0, width: '100%' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>User Details</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'left' }}>Role</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Approval Status</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Account Status</th>
                        <th style={{ padding: '15px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Wallet Balance / Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.users.map((user) => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                          <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px', fontSize: '15px' }}>{user.name}</div>
                            <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>✉️</span> {user.email}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              backgroundColor: user.role === 'admin' ? '#fecdd3' : user.role === 'user' ? '#e0f2fe' : '#fef08a',
                              color: user.role === 'admin' ? '#be123c' : user.role === 'user' ? '#0369a1' : '#a16207',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            {user.isApproved ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                <span style={{ fontSize: '14px' }}>✅</span> Approved
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                <span style={{ fontSize: '14px' }}>⏳</span> Pending
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            {user.accountStatus === "active" || !user.accountStatus ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                Active
                              </div>
                            ) : user.accountStatus === "temporarily_blocked" ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                Blocked (Strikes: {user.strikes || 0})
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                Banned
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', color: '#0ea5e9', fontSize: '16px', marginBottom: '5px' }}>
                              ₹{user.walletBalance || 0}
                            </div>
                            {user.accountStatus === "temporarily_blocked" && (
                              <button 
                                onClick={() => handleUnblock(user._id)}
                                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(59,130,246,0.2)' }}
                              >
                                Unblock User
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="approvals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px', marginTop: '30px', marginBottom: '40px' }}>
            {/* Client Approvals */}
            <div className="approval-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <h3 className="mb-15" style={{ fontSize: "18px", color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', fontWeight: '600' }}>
                <span style={{ fontSize: '22px', backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '10px' }}>👥</span> 
                Client Approvals
                <span style={{ marginLeft: 'auto', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '12px', padding: '2px 8px', borderRadius: '12px' }}>
                  {stats.users.filter(u => !u.isApproved && u.role === "user").length}
                </span>
              </h3>
              <div className="transaction-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: '10px', boxShadow: 'none', margin: 0 }}>
                <table className="transaction-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px 15px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>User Details</th>
                      <th style={{ padding: '12px 15px', color: '#64748b', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.filter(u => !u.isApproved && u.role === "user").map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{user.name}</div>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '14px' }}>✉️</span> {user.email}
                          </div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="accept-btn" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }} onClick={() => handleApprove(user._id)}>Approve</button>
                            <button className="reject-btn" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }} onClick={() => handleReject(user._id)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stats.users.filter(u => !u.isApproved && u.role === "user").length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted" style={{ padding: '40px 20px' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>✨</div>
                          <div style={{ color: '#94a3b8', fontSize: '14px' }}>All clients are approved!</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Volunteer Approvals */}
            <div className="approval-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <h3 className="mb-15" style={{ fontSize: "18px", color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', fontWeight: '600' }}>
                <span style={{ fontSize: '22px', backgroundColor: '#fef08a', padding: '8px', borderRadius: '10px' }}>👷‍♂️</span> 
                Volunteer Approvals
                <span style={{ marginLeft: 'auto', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '12px', padding: '2px 8px', borderRadius: '12px' }}>
                  {stats.users.filter(u => !u.isApproved && u.role === "helper").length}
                </span>
              </h3>
              <div className="transaction-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: '10px', boxShadow: 'none', margin: 0 }}>
                <table className="transaction-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px 15px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Volunteer Details</th>
                      <th style={{ padding: '12px 15px', color: '#64748b', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.filter(u => !u.isApproved && u.role === "helper").map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{user.name}</div>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '14px' }}>✉️</span> {user.email}
                          </div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="accept-btn" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }} onClick={() => handleApprove(user._id)}>Approve</button>
                            <button className="reject-btn" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }} onClick={() => handleReject(user._id)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stats.users.filter(u => !u.isApproved && u.role === "helper").length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted" style={{ padding: '40px 20px' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>✨</div>
                          <div style={{ color: '#94a3b8', fontSize: '14px' }}>All volunteers are approved!</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '40px', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '12px' }}>🚨</span>
            <h3 style={{ fontSize: "24px", margin: 0, color: '#1e293b' }}>User Complaints</h3>
          </div>
          <div className="transaction-table-wrapper mb-30" style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', backgroundColor: '#fff', overflow: 'hidden' }}>
            <table className="transaction-table" style={{ margin: 0, width: '100%' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'left' }}>Report Details</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'left' }}>Complaint Description</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                    <td style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>From</span>
                        <div style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '14px' }}>👤</span> {c.user?.name}
                          <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '10px', color: '#475569' }}>{c.user?.role}</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Against</span>
                        <div style={{ fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '14px' }}>🎯</span> {c.againstUser?.name || "N/A"}
                          <span style={{ fontSize: '10px', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '10px', color: '#b91c1c' }}>{c.againstUser?.role || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: '700', color: '#334155', marginBottom: '6px', fontSize: '15px' }}>{c.subject}</div>
                      <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{c.description}</div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: c.status === "open" ? '#fee2e2' : c.status === "resolved" ? '#dcfce7' : '#e0f2fe',
                        color: c.status === "open" ? '#dc2626' : c.status === "resolved" ? '#16a34a' : '#0284c7',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      {c.status === "open" ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexDirection: 'column' }}>
                          <button className="accept-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 10px rgba(34,197,94,0.2)' }} onClick={() => handleResolveComplaint(c._id, "resolved")}>Mark Resolved</button>
                          <button className="reject-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 10px rgba(100,116,139,0.1)' }} onClick={() => handleResolveComplaint(c._id, "dismissed")}>Dismiss</button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No actions needed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center" style={{ padding: '50px 20px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.5 }}>🕊️</div>
                      <div style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Peaceful day! No complaints filed.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '40px', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', backgroundColor: '#e0e7ff', padding: '10px', borderRadius: '12px' }}>📊</span>
            <h3 style={{ fontSize: "24px", margin: 0, color: '#1e293b' }}>Recent Platform Tasks</h3>
          </div>
          <div className="transaction-table-wrapper mb-30" style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', backgroundColor: '#fff', overflow: 'hidden' }}>
            <table className="transaction-table" style={{ margin: 0, width: '100%' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'left' }}>Task Information</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'left' }}>Involved Parties</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Budget</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontWeight: '600', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasks.slice(0, 10).map((task) => (
                  <tr key={task._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '700', color: '#334155', fontSize: '16px', marginBottom: '6px' }}>{task.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>ID: {task._id.substring(0, 8)}...</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', opacity: 0.7 }}>👤</span>
                          <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>{task.createdBy?.name || "Unknown"}</span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>(Client)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', opacity: task.selectedVolunteer ? 1 : 0.4 }}>👷‍♂️</span>
                          <span style={{ fontSize: '14px', color: task.selectedVolunteer ? '#475569' : '#94a3b8', fontWeight: '600', fontStyle: task.selectedVolunteer ? 'normal' : 'italic' }}>
                            {task.selectedVolunteer ? task.selectedVolunteer.name : "Unassigned"}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>(Volunteer)</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>₹{task.budget}</div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#fef3c7' : '#e0f2fe',
                        color: task.status === 'completed' ? '#166534' : task.status === 'in-progress' ? '#92400e' : '#0369a1',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'inline-block',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}>
                        {task.status || "open"}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.tasks.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center" style={{ padding: '50px 20px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.5 }}>📭</div>
                      <div style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>No tasks found on the platform.</div>
                    </td>
                  </tr>
                )}
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
