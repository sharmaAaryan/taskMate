import { useState } from "react";
import "../App.css";

function PostTask() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEnhance = async () => {
    if (!form.title && !form.description) {
      alert("Please enter a title or a brief description first.");
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/enhance-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: form.title, description: form.description }),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ ...form, description: data.enhancedDescription });
      } else {
        alert(data.message || "Failed to enhance description.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong connecting to AI.");
    } finally {
      setIsEnhancing(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch("http://localhost:5000/api/tasks/create", {
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

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <textarea
              name="description"
              placeholder="Task Description (Write a brief sentence and let AI do the rest!)"
              value={form.description}
              onChange={handleChange}
              rows="12"
              required
              style={{ 
                width: "100%", 
                paddingBottom: "50px", 
                boxSizing: "border-box",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#334155",
                backgroundColor: "#f8fafc",
                resize: "vertical"
              }}
            />
            <button
              type="button"
              onClick={handleEnhance}
              disabled={isEnhancing}
              style={{
                position: "absolute",
                bottom: "15px",
                right: "15px",
                background: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)",
                border: "none",
                color: "white",
                fontWeight: "600",
                cursor: isEnhancing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                padding: "8px 16px",
                borderRadius: "20px",
                boxShadow: "0 4px 10px rgba(139, 92, 246, 0.3)",
                opacity: isEnhancing ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => !isEnhancing && (e.currentTarget.style.transform = "translateY(-2px)", e.currentTarget.style.boxShadow = "0 6px 15px rgba(139, 92, 246, 0.4)")}
              onMouseLeave={(e) => !isEnhancing && (e.currentTarget.style.transform = "translateY(0)", e.currentTarget.style.boxShadow = "0 4px 10px rgba(139, 92, 246, 0.3)")}
            >
              {isEnhancing ? "✨ Thinking..." : "✨ Enhance with AI"}
            </button>
          </div>

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
            min={new Date().toISOString().split("T")[0]}
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