import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

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
      setUser(data.user); // update user state with new skills
      localStorage.setItem("user", JSON.stringify(data.user));
      setNewSkill("");
    } else {
      alert("❌ Failed to add skill");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Skills:</strong> {user.skills?.join(", ") || "None listed"}</p>

      <h3>Add a New Skill</h3>
      <input
        type="text"
        placeholder="Enter new skill"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
      />
      <button onClick={handleAddSkill}>Add Skill</button>
    </div>
  );
};

export default Dashboard;
