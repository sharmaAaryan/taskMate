import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../App.css";

function ViewProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`);
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, [id]);

  if (!profile) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <Link to="/client-dashboard" className="back-link">← Back to Dashboard</Link>
        <div className="profile-header mt-15">
          <div className="avatar">{profile.name.charAt(0).toUpperCase()}</div>
          <h2>{profile.name}</h2>
          <p className="role-badge">{profile.role === "helper" ? "Volunteer" : "Client"}</p>
        </div>

        <div className="profile-details">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Bio:</strong> {profile.bio || "No bio added yet."}</p>
          <div className="skills-list">
            <strong>Skills:</strong>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="skills-flex">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="skill-chip">{skill}</span>
                ))}
              </div>
            ) : (
              <p>No skills listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
