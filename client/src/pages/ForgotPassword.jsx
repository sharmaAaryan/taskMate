import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDevLink("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        if (data.devMode && data.resetUrl) {
          // Store the dev reset link so the user can easily click it in local test
          setDevLink(data.resetUrl);
        }
      } else {
        setMessage(data.message || "Failed to initiate password reset.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Enter your registered email address and we'll help you reset your password.
        </p>

        {message && (
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: devLink ? "#e0f2fe" : "#f3f4f6",
              color: devLink ? "#0369a1" : "#374151",
              fontSize: "14px",
              marginBottom: "20px",
              lineHeight: "1.5",
              border: "1px solid",
              borderColor: devLink ? "#bae6fd" : "#e5e7eb",
            }}
          >
            {message}
          </div>
        )}

        {devLink && (
          <div style={{ marginBottom: "20px" }}>
            <a
              href={devLink}
              target="_blank"
              rel="noreferrer"
              className="primary full-btn"
              style={{
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                backgroundColor: "#10b981",
                color: "white",
              }}
            >
              Go to Password Reset Link (Dev Mode)
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" className="primary full-btn" disabled={loading}>
            {loading ? "Processing..." : "Send Reset Instructions"}
          </button>
        </form>

        <p className="switch-text">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
