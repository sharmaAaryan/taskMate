import { useEffect, useState } from "react";
import "../App.css";

function VolunteerDashboard() {
  const [applications, setApplications] = useState([]);
  const userId = localStorage.getItem("userId");

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

              <p className="task-desc">{task.description}</p>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;