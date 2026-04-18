import { useEffect, useState } from "react";
import "../App.css";

function VolunteerDashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  return (
    <div className="dashboard">
      <h2>Available Tasks</h2>

      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task._id} className="task-card-premium">
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <p>👤 {task.createdBy?.name || "Unknown"}</p>
            <p>💰 ₹{task.budget}</p>
            <p>📅 {new Date(task.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VolunteerDashboard;