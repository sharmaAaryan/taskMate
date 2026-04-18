import { useEffect, useState } from "react";
import "../App.css";

function ClientDashboard() {
  const [tasks, setTasks] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchMyTasks();
  }, []);

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

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">My Posted Tasks</h2>

      {tasks.length === 0 ? (
        <p className="no-task">No tasks posted yet</p>
      ) : (
        tasks.map((task) => (
          <div key={task._id} className="task-card-modern">

            {/* Header */}
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className="deadline">
                📅 {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            <p className="task-desc">{task.description}</p>

            {/* Budget */}
            <div className="task-meta">
              <span className="budget">💰 ₹{task.budget}</span>
            </div>

            {/* Applicants */}
            <div className="applicants-section">
              <h4>Applicants</h4>

              {task.applicants && task.applicants.length > 0 ? (
                <div className="applicant-list">
                  {task.applicants.map((app, index) => (
                    <div key={index} className="applicant-chip">
                      👤 {app.name || "User"}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-applicants">No applicants yet</p>
              )}
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default ClientDashboard;