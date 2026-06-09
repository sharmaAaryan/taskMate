import { useState } from "react";
import "../App.css";

const SubmitComplaint = () => {
  const [againstUserEmail, setAgainstUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description || !againstUserEmail) return alert("Please fill in all fields.");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, againstUserEmail, subject, description, taskId: taskId || undefined }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      alert(data.message);
      setAgainstUserEmail("");
      setSubject("");
      setDescription("");
      setTaskId("");
    } catch (error) {
      console.log(error);
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div className="text-center mt-15 text-xl font-bold">Please log in to submit a complaint.</div>;
  }

  return (
    <div className="task-container">
      <div className="task-card">
        <h2>Submit a Complaint</h2>
        <p className="text-muted mb-20 text-center" style={{ fontSize: "14px" }}>
          Have an issue with a user or the platform? Let our admins know and we will resolve it.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email of user you are complaining against"
            value={againstUserEmail}
            onChange={(e) => setAgainstUserEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Task ID (Optional, if related to a specific task)"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Subject of Issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            rows="5"
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit" className="primary full-btn mt-10" disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
