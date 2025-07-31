import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addSkill, removeSkill, getUserProfile, updateDistancePreferences, updateUserLocation } from "../api/auth";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Distance preferences
  const [useDistanceMatching, setUseDistanceMatching] = useState(false);
  const [maxMatchDistance, setMaxMatchDistance] = useState(50);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await getUserProfile(token);
      const userData = response.user;
      
      setUser(userData);
      setUseDistanceMatching(userData.useDistanceMatching || false);
      setMaxMatchDistance(userData.maxMatchDistance || 50);
      setHasLocation(userData.hasLocation || false);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOfferedSkill = async () => {
    if (!newOfferedSkill.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const data = await addSkill(newOfferedSkill, token);
      setUser(data.user);
      setNewOfferedSkill("");
      setMessage("Skill added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to add skill");
    }
  };

  const handleRemoveOfferedSkill = async (skill) => {
    try {
      const token = localStorage.getItem("token");
      const data = await removeSkill(skill, token);
      setUser(data.user);
      setMessage(`Removed skill: ${skill}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to remove skill");
    }
  };

  const handleAddWantedSkill = async () => {
    if (!newWantedSkill.trim()) return;
    try {
      const token = localStorage.getItem("token");
      // You'll need to create this API endpoint
      const response = await fetch("http://localhost:5000/api/auth/add-wanted-skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skill: newWantedSkill }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setNewWantedSkill("");
        setMessage("Wanted skill added successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to add wanted skill");
    }
  };

  const handleRemoveWantedSkill = async (skill) => {
    try {
      const token = localStorage.getItem("token");
      // You'll need to create this API endpoint
      const response = await fetch("http://localhost:5000/api/auth/remove-wanted-skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skill }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage(`Removed wanted skill: ${skill}`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to remove wanted skill");
    }
  };

  const handleUpdateDistancePreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      await updateDistancePreferences(useDistanceMatching, maxMatchDistance, token);
      setMessage("Distance preferences updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update distance preferences");
    }
  };

  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser");
      return;
    }

    setMessage("Getting your location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem("token");
          await updateUserLocation(
            position.coords.latitude,
            position.coords.longitude,
            token
          );
          
          setHasLocation(true);
          setMessage("Location updated successfully!");
          setTimeout(() => setMessage(""), 3000);
        } catch (error) {
          setMessage("Error updating location: " + error.message);
        }
      },
      (error) => {
        setMessage("Failed to get your location. Please enable location access.");
      }
    );
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading profile...</div>;
  }

  if (!user) {
    return <div style={{ padding: "20px" }}>Failed to load profile</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#6c757d", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1>My Profile</h1>
      
      {message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          backgroundColor: message.includes("Error") || message.includes("Failed") ? "#f8d7da" : "#d4edda",
          color: message.includes("Error") || message.includes("Failed") ? "#721c24" : "#155724",
          border: `1px solid ${message.includes("Error") || message.includes("Failed") ? "#f5c6cb" : "#c3e6cb"}`,
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}

      {/* Basic Info */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f8f9fa"
      }}>
        <h2>Basic Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Skills Offered */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        border: "1px solid #ddd", 
        borderRadius: "8px"
      }}>
        <h2>Skills I Offer</h2>
        <div style={{ marginBottom: "15px" }}>
          {user.skillsOffered?.length ? (
            user.skillsOffered.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  margin: "5px",
                  padding: "8px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "20px",
                  cursor: "pointer",
                  userSelect: "none"
                }}
                onClick={() => handleRemoveOfferedSkill(skill)}
                title="Click to remove"
              >
                {skill} ×
              </span>
            ))
          ) : (
            <p style={{ color: "#666" }}>No skills offered yet</p>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Add a skill you can offer"
            value={newOfferedSkill}
            onChange={(e) => setNewOfferedSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOfferedSkill()}
            style={{ 
              flex: 1, 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
          />
          <button 
            onClick={handleAddOfferedSkill}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Skills Wanted */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        border: "1px solid #ddd", 
        borderRadius: "8px"
      }}>
        <h2>Skills I Want to Learn</h2>
        <div style={{ marginBottom: "15px" }}>
          {user.skillsWanted?.length ? (
            user.skillsWanted.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  margin: "5px",
                  padding: "8px 12px",
                  backgroundColor: "#ffc107",
                  color: "#212529",
                  borderRadius: "20px",
                  cursor: "pointer",
                  userSelect: "none"
                }}
                onClick={() => handleRemoveWantedSkill(skill)}
                title="Click to remove"
              >
                {skill} ×
              </span>
            ))
          ) : (
            <p style={{ color: "#666" }}>No skills wanted yet</p>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Add a skill you want to learn"
            value={newWantedSkill}
            onChange={(e) => setNewWantedSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWantedSkill()}
            style={{ 
              flex: 1, 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
          />
          <button 
            onClick={handleAddWantedSkill}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#fd7e14", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Distance Preferences */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f8f9fa"
      }}>
        <h2>Matching Preferences</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={useDistanceMatching}
              onChange={(e) => setUseDistanceMatching(e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            Enable distance-based matching
          </label>
        </div>

        {useDistanceMatching && (
          <div style={{ marginLeft: "20px", marginBottom: "15px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label>
                Maximum distance for matches: 
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={maxMatchDistance}
                  onChange={(e) => setMaxMatchDistance(Number(e.target.value))}
                  style={{ 
                    marginLeft: "10px", 
                    width: "80px",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                />
                km
              </label>
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#666" }}>
                Location status: {hasLocation ? "✅ Set" : "❌ Not set"}
              </p>
              
              <button 
                onClick={handleUpdateLocation}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: hasLocation ? "#28a745" : "#007bff", 
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                {hasLocation ? "Update Location" : "Enable Location"}
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpdateDistancePreferences}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Profile;