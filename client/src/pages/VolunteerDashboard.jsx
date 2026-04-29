import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function VolunteerDashboard() {
  const [applications, setApplications] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressTask, setProgressTask] = useState(null);
  const [progressForm, setProgressForm] = useState({ description: "", fileUrl: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressForm.description) return alert("Description is required");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/tasks/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: progressTask,
          description: progressForm.description,
          fileUrl: progressForm.fileUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Progress submitted successfully! 🚀");
        setProgressTask(null);
        setProgressForm({ description: "", fileUrl: "" });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/apply/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchMyApplications();
  }, [userId]);

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">My Applications</h2>

      {applications.length === 0 ? (
        <p className="no-task">You haven't applied to any tasks yet.</p>
      ) : (
        <div className="task-grid">
          {applications.map(({ _id, task, status, appliedAt }) => (
            <div key={_id} className="task-card-modern">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status-badge ${status.toLowerCase()}`}>
                  {status}
                </span>
              </div>

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

              <div className="task-meta">
                <span className="posted-by">
                  👤 {task.createdBy?.name || "Unknown Client"}
                </span>
                <span className="budget">💰 ₹{task.budget}</span>
              </div>

              <div className="task-meta mt-10">
                <span className="deadline">
                  📅 Deadline: {new Date(task.deadline).toLocaleDateString()}
                </span>
                <span className="applied-date">
                  Applied: {new Date(appliedAt).toLocaleDateString()}
                </span>
              </div>

              {status.toLowerCase() === "accepted" && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    className="secondary"
                    onClick={() => navigate(`/chat/${task._id}`)}
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Chat 💬
                  </button>
                  <button
                    className="primary"
                    onClick={() => setProgressTask(task._id)}
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Submit Progress 📈
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
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
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Posted by: {selectedTask.createdBy?.name || "Unknown"}</p>
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

      {/* Submit Progress Modal */}
      {progressTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Submit Progress Report</h3>
              <button onClick={() => setProgressTask(null)} style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleProgressSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Progress Description</label>
                <textarea
                  placeholder="What have you completed so far?"
                  value={progressForm.description}
                  onChange={(e) => setProgressForm({...progressForm, description: e.target.value})}
                  rows="4"
                  required
                  style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Link to Pictures/Documents (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. Google Drive, Dropbox, Imgur link"
                  value={progressForm.fileUrl}
                  onChange={(e) => setProgressForm({...progressForm, fileUrl: e.target.value})}
                  style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Submitting..." : "Send to Client 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;