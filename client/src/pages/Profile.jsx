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
          {profile.ratings && profile.ratings.length > 0 && (
             <p style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>
               ⭐ {(profile.ratings.reduce((acc, curr) => acc + curr.score, 0) / profile.ratings.length).toFixed(1)} / 5 <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>({profile.ratings.length} reviews)</span>
             </p>
          )}
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
            
            {/* Reviews Section */}
            {profile.ratings && profile.ratings.length > 0 && (
              <div className="reviews-section" style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>Client Reviews</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {profile.ratings.map((rating, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{rating.byUser?.name || "Unknown Client"}</span>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{'⭐'.repeat(rating.score)}</span>
                      </div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>
                        "{rating.review || "No written review provided."}"
                      </p>
                      {rating.taskId && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Task: {rating.taskId.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
