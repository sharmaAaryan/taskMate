import { useEffect, useState } from "react";
import "../App.css";

function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [date, setDate] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch("http://localhost:5000/api/tasks");
      const data = await res.json();
      setTasks(data);
    };

    fetchTasks();
  }, []);

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
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="browse-container">
      <h2 className="browse-title">Available Tasks</h2>

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
            <div key={task._id} className="task-card-premium">
              <h3>{task.title}</h3>

              <p className="posted-by">
                👤 {task.createdBy?.name || "Unknown"}
              </p>

              <p className="desc">{task.description}</p>

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
    </div>
  );
}

export default BrowseTasks;