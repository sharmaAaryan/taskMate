import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function ClientDashboard() {
  const [tasks, setTasks] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // State for Task Completion Flow
  const [completingTask, setCompletingTask] = useState(null);
  const [score, setScore] = useState(5);
  const [review, setReview] = useState("");
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("all");

  // Selected Task State (Modal)
  const [selectedTask, setSelectedTask] = useState(null);

  // Update Task State
  const [updatingTask, setUpdatingTask] = useState(null);
  const [newBudget, setNewBudget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks`);
        const data = await res.json();

        const myTasks = data.filter(
          (task) => task.createdBy?._id === userId
        );

        setTasks(myTasks);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMyTasks();
  }, [userId, refresh]);

  /* ✅ Accept Applicant */
  const handleAccept = async (taskId, applicantId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, userId: applicantId }),
      });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  /* ❌ Reject Applicant */
  const handleReject = async (taskId, applicantId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, userId: applicantId }),
      });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  /* 🏆 Submit Completion & Review */
  const handleComplete = async (taskId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          score,
          review,
          byUserId: userId,
        }),
      });

      const data = await res.json();
      alert(data.message);

      setCompletingTask(null);
      setScore(5);
      setReview("");
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  /* 🗑️ Delete Task */
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  /* 🔄 Update Expired Task */
  const handleUpdateTask = async (taskId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/tasks/update-expired/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: newBudget, deadline: newDeadline }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      alert(data.message);
      setUpdatingTask(null);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    const stat = task.status || "open";
    return stat === activeTab;
  });

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const dl = new Date(deadline);
    dl.setHours(23, 59, 59, 999);
    return new Date() > dl;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header-flex">
        <h2 className="dashboard-title">My Posted Tasks</h2>
      </div>

      {/* Tabs UI */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`} 
          onClick={() => setActiveTab("all")}
        >
          All Tasks
        </button>
        <button 
          className={`tab-btn ${activeTab === "open" ? "active" : ""}`} 
          onClick={() => setActiveTab("open")}
        >
          Pending
        </button>
        <button 
          className={`tab-btn ${activeTab === "in-progress" ? "active" : ""}`} 
          onClick={() => setActiveTab("in-progress")}
        >
          In Progress
        </button>
        <button 
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`} 
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="no-task">No tasks found in this category.</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task._id} className="task-card-modern">
            {/* Header */}
            <div className="task-header">
              <div className="title-group">
                <h3>{task.title}</h3>
                {(!task.status || task.status === "open" || task.status === "completed") && (
                  <button 
                    className="delete-icon-btn" 
                    title="Delete Task"
                    onClick={() => handleDelete(task._id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {task.status === "in-progress" && isOverdue(task.deadline) && (
                  <span style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                    ⚠️ OVERDUE
                  </span>
                )}
                <span className={`status-badge ${task.status || "open"}`}>
                  {task.status || "open"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="task-desc-container">
              <p 
                className="task-desc" 
                style={{ 
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  margin: '10px 0',
                  lineHeight: '1.5'
                }}
              >
                {task.description}
              </p>
              {task.description && task.description.length > 150 && (
                <button 
                  onClick={() => setSelectedTask(task)}
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0', fontSize: '13px', fontWeight: '600', marginBottom: '15px' }}
                >
                  View Details
                </button>
              )}
            </div>

            {/* Budget & Deadline */}
            <div className="task-meta">
              <span className="budget">💰 ₹{task.budget}</span>
              <span className="deadline">
                📅 {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* Conditional Rendering based on Status */}
            
            {/* 1. If Open or In-Progress -> Show Applicants */}
            {(task.status === "open" || task.status === "in-progress" || !task.status) && (
              <div className="applicants-section mt-15">
                {isOverdue(task.deadline) && (
                  <div className="overdue-update-section">
                    <p className="overdue-warning-text">⚠️ Task deadline has passed without being accepted.</p>
                    {updatingTask !== task._id ? (
                      <button className="primary btn-sm" onClick={() => { setUpdatingTask(task._id); setNewBudget(task.budget); setNewDeadline(task.deadline.split('T')[0]); }}>
                        Update Deadline & Budget
                      </button>
                    ) : (
                      <div className="update-form">
                        <div className="update-form-row">
                          <div className="update-form-group">
                            <label className="update-form-label">New Budget (₹)</label>
                            <input type="number" className="update-form-input" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
                          </div>
                          <div className="update-form-group">
                            <label className="update-form-label">New Deadline</label>
                            <input type="date" className="update-form-input" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
                          </div>
                        </div>
                        <div className="update-form-actions">
                          <button className="accept-btn" onClick={() => handleUpdateTask(task._id)}>Save Changes</button>
                          <button className="reject-btn" onClick={() => setUpdatingTask(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <h4>Applicants</h4>
                {task.applicants && task.applicants.length > 0 ? (
                  <div className="applicant-list">
                    {task.applicants.map((app, index) => {
                      const isAccepted = task.selectedVolunteers?.some(v => (v._id || v) === app.user);
                      return (
                      <div key={index} className={`applicant-card ${isAccepted ? 'accepted-card' : ''}`}>
                        <div className="applicant-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>👤</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{app.name || "User"}</span>
                          </div>
                          {isAccepted && <span className="accepted-badge">✓ Accepted</span>}
                        </div>
                        <div className="applicant-actions">
                          <Link to={`/user/${app.user}`} className="view-profile-btn">
                            View Profile
                          </Link>
                          {!isAccepted && (
                            <div className="applicant-actions-row">
                              <button
                                className="accept-btn action-btn"
                                onClick={() => handleAccept(task._id, app.user)}
                              >
                                Accept
                              </button>
                              <button
                                className="reject-btn action-btn"
                                onClick={() => handleReject(task._id, app.user)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <p className="no-applicants">No applicants yet.</p>
                )}
              </div>
            )}

            {/* 2. If In-Progress -> Show Complete flow */}
            {task.status === "in-progress" && (
              <div className="in-progress-section mt-15">
                <div className="in-progress-notice" style={isOverdue(task.deadline) ? { borderLeftColor: '#ef4444', backgroundColor: '#fef2f2', color: '#991b1b' } : {}}>
                  <p>{isOverdue(task.deadline) ? "⚠️ The deadline for this task has passed. You may want to contact the volunteer(s)." : "🚀 This task is currently assigned and in progress."}</p>
                  
                  {/* Show Progress Reports if any */}
                  {task.progressReports && task.progressReports.length > 0 && (
                    <div style={{ marginTop: '15px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#334155' }}>Recent Progress Reports</h4>
                      {task.progressReports.map((report, idx) => (
                        <div key={idx} style={{ marginBottom: idx !== task.progressReports.length - 1 ? '15px' : '0', paddingBottom: idx !== task.progressReports.length - 1 ? '15px' : '0', borderBottom: idx !== task.progressReports.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#475569' }}>{report.description}</p>
                          {report.fileUrl && (
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#5a5af7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                              📎 View Attached File/Link
                            </a>
                          )}
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Submitted: {new Date(report.submittedAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {completingTask !== task._id ? (
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button 
                        className="primary" 
                        onClick={() => setCompletingTask(task._id)}
                      >
                        Mark as Completed
                      </button>
                      <button
                        className="secondary"
                        onClick={() => navigate(`/chat/${task._id}`)}
                      >
                        Chat 💬
                      </button>
                    </div>
                  ) : (
                    <div className="review-box mt-10">
                      <h4>Review the Volunteer</h4>
                      <div className="rating-select">
                        <label>Rating (1-5): </label>
                        <select 
                          value={score} 
                          onChange={(e) => setScore(e.target.value)}
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value="4">⭐⭐⭐⭐ (4/5)</option>
                          <option value="3">⭐⭐⭐ (3/5)</option>
                          <option value="2">⭐⭐ (2/5)</option>
                          <option value="1">⭐ (1/5)</option>
                        </select>
                      </div>
                      
                      <textarea
                        className="review-input mt-10"
                        placeholder="Leave a short review (optional)..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows="2"
                      />
                      
                      <div className="review-actions mt-10">
                        <button 
                          className="accept-btn"
                          onClick={() => handleComplete(task._id)}
                        >
                          Complete & Pay
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => setCompletingTask(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. If Completed -> Show Completed Info */}
            {task.status === "completed" && (
              <div className="completed-section mt-15">
                <p>✅ <strong>This task has been successfully completed!</strong></p>
              </div>
            )}

          </div>
        ))
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                &times;
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '10px 0', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', fontSize: '15px', flex: 1 }}>
              {selectedTask.description}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
               <div>
                 <span style={{ fontWeight: '600', color: '#10b981', fontSize: '16px', marginRight: '15px' }}>💰 ₹{selectedTask.budget}</span>
                 <span style={{ color: '#64748b', fontSize: '14px' }}>📅 {new Date(selectedTask.deadline).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;