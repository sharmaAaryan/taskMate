import { useEffect, useState } from "react";
import "../App.css";

function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  const applyTask = async (taskId) => {
    const userId = localStorage.getItem("userId");

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
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="browse-container">
      <h2 className="browse-title">Available Tasks</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="filters">
        <input
          type="number"
          placeholder="Max Budget"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Tasks */}
      <div className="task-grid">
        {tasks
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
            <div key={task._id} className="task-card-premium">
              <h3>{task.title}</h3>

              <p className="posted-by">
                👤 {task.createdBy?.name || "Unknown"}
              </p>

              <p className="desc">{task.description}</p>

              <div className="task-info">
                <span>💰 ₹{task.budget}</span>
                <span>
                  📅{" "}
                  {new Date(task.deadline).toLocaleDateString()}
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
    </div>
  );
}

export default BrowseTasks;