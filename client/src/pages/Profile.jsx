import { useState, useEffect } from "react";
import "../App.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        const data = await res.json();
        setProfile(data);
        setBio(data.bio || "");
        setSkills(data.skills ? data.skills.join(", ") : "");
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, skills }),
      });
      const data = await res.json();
      setProfile(data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  if (!profile) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">{profile.name.charAt(0).toUpperCase()}</div>
          <h2>{profile.name}</h2>
          <p className="role-badge">{profile.role === "helper" ? "Volunteer" : "Client"}</p>
        </div>

        {!editMode ? (
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
                <p>No skills added.</p>
              )}
            </div>
            <button className="primary full-btn mt-15" onClick={() => setEditMode(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-form">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
              rows="3"
            />
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (comma separated, e.g. React, Node, Design)"
            />
            <div className="buttons">
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
