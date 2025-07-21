import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      console.log("👤 User from localStorage:", parsedUser);
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/add-skill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skill: newSkill }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Skill added!");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setNewSkill("");
    } else {
      alert("❌ Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/remove-skill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skill: skillToRemove }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`🗑️ Removed skill: ${skillToRemove}`);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      alert("❌ Failed to remove skill");
    }
  };

  
  const skills = user?.skillsOffered || user?.skills || [];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      {!user ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {skills.length ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    cursor: "pointer",
                    marginRight: "8px",
                    padding: "4px 8px",
                    backgroundColor: "#eee",
                    borderRadius: "4px",
                    userSelect: "none",
                    color: "#333",
                    border: "1px solid #ccc",
                    display: "inline-block",
                  }}
                  title="Click to remove"
                >
                  {skill?.trim() || "Unnamed Skill"} &times;
                </span>
              ))
            ) : (
              "None listed"
            )}
          </p>

          <h3>Add a New Skill</h3>
          <input
            type="text"
            placeholder="Enter new skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button onClick={handleAddSkill} style={{ marginLeft: "10px" }}>
            Add Skill
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
