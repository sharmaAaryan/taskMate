import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ClientDashboard() {
  const [tasks, setTasks] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const userId = localStorage.getItem("userId");

  // State for Task Completion Flow
  const [completingTask, setCompletingTask] = useState(null);
  const [score, setScore] = useState(5);
  const [review, setReview] = useState("");
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
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
      const res = await fetch("http://localhost:5000/api/tasks/accept", {
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
      const res = await fetch("http://localhost:5000/api/tasks/reject", {
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
      const res = await fetch("http://localhost:5000/api/tasks/complete", {
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
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
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
              <span className={`status-badge ${task.status || "open"}`}>
                {task.status || "open"}
              </span>
            </div>

            {/* Description */}
            <p className="task-desc">{task.description}</p>

            {/* Budget & Deadline */}
            <div className="task-meta">
              <span className="budget">💰 ₹{task.budget}</span>
              <span className="deadline">
                📅 {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* Conditional Rendering based on Status */}
            
            {/* 1. If Open -> Show Applicants */}
            {(task.status === "open" || !task.status) && (
              <div className="applicants-section mt-15">
                <h4>Applicants</h4>
                {task.applicants && task.applicants.length > 0 ? (
                  <div className="applicant-list">
                    {task.applicants.map((app, index) => (
                      <div key={index} className="applicant-card">
                        <span>👤 {app.name || "User"}</span>
                        <div className="applicant-actions">
                          <Link to={`/user/${app.user}`} className="view-profile-btn">
                            View Profile
                          </Link>
                          <button
                            className="accept-btn"
                            onClick={() => handleAccept(task._id, app.user)}
                          >
                            Accept
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReject(task._id, app.user)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-applicants">No applicants yet.</p>
                )}
              </div>
            )}

            {/* 2. If In-Progress -> Show Complete flow */}
            {task.status === "in-progress" && (
              <div className="in-progress-section mt-15">
                <div className="in-progress-notice">
                  <p>🚀 This task is currently assigned and in progress.</p>
                  
                  {completingTask !== task._id ? (
                    <button 
                      className="primary mt-10" 
                      onClick={() => setCompletingTask(task._id)}
                    >
                      Mark as Completed
                    </button>
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
                          Submit & Complete
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
    </div>
  );
}

export default ClientDashboard;