import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Password has been successfully reset! ✅");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Please choose a strong new password for your account.
        </p>

        {error && (
          <div
            style={{
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontSize: "14px",
              marginBottom: "15px",
              border: "1px solid #fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#d1fae5",
              color: "#065f46",
              fontSize: "14px",
              marginBottom: "15px",
              border: "1px solid #6ee7b7",
            }}
          >
            {success}
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Redirecting you to login...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button type="submit" className="primary full-btn" disabled={loading}>
            {loading ? "Resetting..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
