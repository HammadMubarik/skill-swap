import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Redirect to login if no user
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      {!user ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Skills:</strong> {user.skills || "None listed"}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
