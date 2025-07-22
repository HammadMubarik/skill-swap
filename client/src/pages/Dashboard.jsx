import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [matches, setMatches] = useState({
    usersWantingMySkills: [],
    usersOfferingWhatINeed: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const token = localStorage.getItem("token");
      fetch("http://localhost:5000/api/auth/match", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setMatches({
            usersWantingMySkills: data.usersWantingMySkills || [],
            usersOfferingWhatINeed: data.usersOfferingWhatINeed || [],
          });
        })
        .catch((err) => console.error("Match fetch error:", err));
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
      alert("Skill added!");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setNewSkill("");
    } else {
      alert("Failed to add skill");
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
      alert(`Removed skill: ${skillToRemove}`);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      alert("Failed to remove skill");
    }
  };

  const startChatWith = (userToChatWith) => {
    localStorage.setItem("chatUser", JSON.stringify(userToChatWith));
    navigate("/chat");
  };

return (
  <div style={{ padding: "20px" }}>
    <h2>Dashboard</h2>
    {!user ? (
      <p>Loading...</p>
    ) : (
      <div>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Skills Offered:</strong>{" "}
          {user.skillsOffered?.length ? (
            user.skillsOffered.map((skill, index) => (
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
                {skill.trim() || "Unnamed Skill"} &times;
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

        <hr style={{ margin: "20px 0" }} />

        <h3>🔁 Skill Matches</h3>

        <div style={{ marginBottom: "1rem" }}>
          <strong>People who want your skills:</strong>
          {matches.usersWantingMySkills.length === 0 ? (
            <p>None found</p>
          ) : (
            <ul>
              {matches.usersWantingMySkills.map((u) => (
                <li key={u._id}>
                  {u.name} ({u.email}) – Wants:{" "}
                  {u.skillsWanted?.join(", ") || "None"}{" "}
                  <button onClick={() => startChatWith(u)}>💬 Text</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>People who offer what you want:</strong>
          {matches.usersOfferingWhatINeed.length === 0 ? (
            <p>None found</p>
          ) : (
            <ul>
              {matches.usersOfferingWhatINeed.map((u) => (
                <li key={u._id}>
                  {u.name} ({u.email}) – Offers:{" "}
                  {u.skillsOffered?.join(", ") || "None"}{" "}
                  <button onClick={() => startChatWith(u)}>💬 Text</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Mutual Skill Matches:</strong>
          <ul>
            {matches.usersWantingMySkills
              .filter((u) =>
                matches.usersOfferingWhatINeed.some((other) => other._id === u._id)
              )
              .map((mutualUser) => (
                <li key={mutualUser._id}>
                  You <strong>match with</strong> {mutualUser.name} – Wants:{" "}
                  {mutualUser.skillsWanted?.join(", ")} | Offers:{" "}
                  {mutualUser.skillsOffered?.join(", ")}{" "}
                  <button onClick={() => startChatWith(mutualUser)}> Text</button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

};

export default Dashboard;
