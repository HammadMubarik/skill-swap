import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMatchData,
  addSkill,
  removeSkill,
} from "../api/auth"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [matches, setMatches] = useState({
    usersWantingMySkills: [],
    usersOfferingWhatINeed: [],
  });

  // Load user data and matches on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const token = localStorage.getItem("token");
      fetchMatchData(token)
        .then((data) => {
          setMatches({
            usersWantingMySkills: data.usersWantingMySkills || [],
            usersOfferingWhatINeed: data.usersOfferingWhatINeed || [],
          });
        })
        .catch((err) => console.error("Match fetch error:", err));
    }
  }, [navigate]);

  // Add new skill to user's offered skills
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const data = await addSkill(newSkill, token);
      if (data) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setNewSkill("");
      }
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  // Remove skill from user's offered skills
  const handleRemoveSkill = async (skillToRemove) => {
    const token = localStorage.getItem("token");
    try {
      const data = await removeSkill(skillToRemove, token);
      if (data) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Failed to remove skill:", error);
    }
  };

  // Navigate to chat with selected user
  const startChatWith = (userToChatWith) => {
    localStorage.setItem("chatUser", JSON.stringify(userToChatWith));
    navigate("/chat");
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-container">
        <h1>Dashboard</h1>
        
        {/* Profile button */}
        <div className="nav-button">
          <button 
            onClick={() => navigate("/profile")}
            className="btn btn-primary"
          >
            My Profile
          </button>
        </div>

        {/* User info card */}
        <div className="card">
          <div className="card-header">
            <h2>My Information</h2>
          </div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <div>
            <strong>Skills Offered:</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {user.skillsOffered?.length ? (
                user.skillsOffered.map((skill, index) => (
                  <span
                    key={index}
                    className="skill-tag offered"
                    onClick={() => handleRemoveSkill(skill)}
                    title="Click to remove"
                  >
                    {skill.trim() || "Unnamed Skill"} ×
                  </span>
                ))
              ) : (
                <span style={{ color: "#7f8c8d" }}>None listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Add new skill section */}
        <div className="card">
          <h3>Add a New Skill</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter new skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              style={{ flex: 1 }}
            />
            <button onClick={handleAddSkill} className="btn btn-success">
              Add Skill
            </button>
          </div>
        </div>

        {/* Matches section */}
        <div className="card">
          <h2>Skill Matches</h2>

          {/* People who want your skills */}
          <div style={{ marginBottom: "2rem" }}>
            <h3>People who want your skills:</h3>
            {matches.usersWantingMySkills.length === 0 ? (
              <p style={{ color: "#7f8c8d" }}>None found</p>
            ) : (
              <ul className="user-list">
                {matches.usersWantingMySkills.map((u) => (
                  <li key={u._id}>
                    <strong>{u.name}</strong> ({u.email})
                    <br />
                    <small>Wants: {u.skillsWanted?.join(", ") || "None"}</small>
                    <br />
                    <button 
                      onClick={() => startChatWith(u)}
                      className="btn btn-primary btn-small"
                      style={{ marginTop: "0.5rem" }}
                    >
                      Start Chat
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* People who offer what you want */}
          <div style={{ marginBottom: "2rem" }}>
            <h3>People who offer what you want:</h3>
            {matches.usersOfferingWhatINeed.length === 0 ? (
              <p style={{ color: "#7f8c8d" }}>None found</p>
            ) : (
              <ul className="user-list">
                {matches.usersOfferingWhatINeed.map((u) => (
                  <li key={u._id}>
                    <strong>{u.name}</strong> ({u.email})
                    <br />
                    <small>Offers: {u.skillsOffered?.join(", ") || "None"}</small>
                    <br />
                    <button 
                      onClick={() => startChatWith(u)}
                      className="btn btn-primary btn-small"
                      style={{ marginTop: "0.5rem" }}
                    >
                      Start Chat
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mutual matches */}
          <div>
            <h3>Mutual Skill Matches:</h3>
            {matches.usersWantingMySkills
              .filter((u) =>
                matches.usersOfferingWhatINeed.some((other) => other._id === u._id)
              )
              .length === 0 ? (
              <p style={{ color: "#7f8c8d" }}>No mutual matches found</p>
            ) : (
              <ul className="user-list">
                {matches.usersWantingMySkills
                  .filter((u) =>
                    matches.usersOfferingWhatINeed.some((other) => other._id === u._id)
                  )
                  .map((mutualUser) => (
                    <li key={mutualUser._id} style={{ borderLeftColor: "#27ae60" }}>
                      <strong>🤝 Perfect Match: {mutualUser.name}</strong>
                      <br />
                      <small>
                        Wants: {mutualUser.skillsWanted?.join(", ")} | 
                        Offers: {mutualUser.skillsOffered?.join(", ")}
                      </small>
                      <br />
                      <button 
                        onClick={() => startChatWith(mutualUser)}
                        className="btn btn-success btn-small"
                        style={{ marginTop: "0.5rem" }}
                      >
                        Start Chat
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;