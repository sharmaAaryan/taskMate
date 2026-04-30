import { useEffect, useState } from "react";
import "../App.css";

function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [date, setDate] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [hasActiveTask, setHasActiveTask] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchMyApplications = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/apply/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          const active = data.some(app => ["pending", "accepted", "in-progress"].includes(app.status.toLowerCase()));
          setHasActiveTask(active);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchTasks();
    fetchMyApplications();
  }, [userId]);

  const applyTask = async (taskId) => {

    const res = await fetch("http://localhost:5000/api/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId, userId }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Applied Successfully ✅");
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setHasActiveTask(true);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="browse-container">
      <h2 className="browse-title">Available Tasks</h2>

      {hasActiveTask && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
          🚨 You already have an active application or ongoing task! Please complete it before applying for new ones.
        </div>
      )}

      {/* 🔍 Search + Filters */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-group">
          <input
            type="number"
            placeholder="💰 Max Budget"
            className="filter-input"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />

          <input
            type="date"
            className="filter-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            className="clear-btn"
            onClick={() => {
              setSearch("");
              setMaxBudget("");
              setDate("");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* 📦 Task Cards */}
      <div className="task-grid">
        {tasks
          .filter((task) => !task.status || task.status === "open")
          .filter((task) => !task.applicants?.some((app) => app.user === userId))
          .filter((task) =>
            task.title.toLowerCase().includes(search.toLowerCase())
          )
          .filter((task) =>
            maxBudget ? task.budget <= maxBudget : true
          )
          .filter((task) =>
            date ? new Date(task.deadline) <= new Date(date) : true
          )
          .map((task) => (
            <div 
              key={task._id} 
              className="task-card-premium"
              style={hasActiveTask ? { filter: 'blur(3px)', opacity: 0.7, pointerEvents: 'none' } : {}}
            >
              <h3>{task.title}</h3>

              <p className="posted-by">
                👤 {task.createdBy?.name || "Unknown"}
              </p>

              <div className="task-desc-container">
                <p 
                  className="desc" 
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

              <div className="task-info">
                <span>💰 ₹{task.budget}</span>
                <span>
                  📅 {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>

              <button
                className="apply-btn"
                onClick={() => applyTask(task._id)}
              >
                Apply Now
              </button>
            </div>
          ))}
      </div>

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
               <button
                 onClick={() => {
                    applyTask(selectedTask._id);
                    setSelectedTask(null);
                 }}
                 style={{ background: '#5a5af7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }}
                 onMouseEnter={(e) => e.currentTarget.style.background = '#4444dd'}
                 onMouseLeave={(e) => e.currentTarget.style.background = '#5a5af7'}
               >
                 Apply Now
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseTasks;