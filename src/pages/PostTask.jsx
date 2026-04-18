import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function PostTask() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, userId }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Task Posted ✅");

      setForm({
        title: "",
        description: "",
        budget: "",
        deadline: "",
      });
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="task-container">
      <div className="task-card">
        <h2>Post a New Task</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Task Description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            required
          />

          <input
            type="number"
            name="budget"
            placeholder="Budget (₹)"
            value={form.budget}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary full-btn">
            Post Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostTask;