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

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fetch user profile from API
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

  // Show temporary message
  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // Add offered skill
  const handleAddOfferedSkill = async () => {
    if (!newOfferedSkill.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const data = await addSkill(newOfferedSkill, token);
      setUser(data.user);
      setNewOfferedSkill("");
      showMessage("Skill added successfully!");
    } catch (error) {
      showMessage("Failed to add skill", true);
    }
  };

  // Remove offered skill
  const handleRemoveOfferedSkill = async (skill) => {
    try {
      const token = localStorage.getItem("token");
      const data = await removeSkill(skill, token);
      setUser(data.user);
      showMessage(`Removed skill: ${skill}`);
    } catch (error) {
      showMessage("Failed to remove skill", true);
    }
  };

  // Add wanted skill
  const handleAddWantedSkill = async () => {
    if (!newWantedSkill.trim()) return;
    try {
      const token = localStorage.getItem("token");
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
        showMessage("Wanted skill added successfully!");
      }
    } catch (error) {
      showMessage("Failed to add wanted skill", true);
    }
  };

  // Remove wanted skill
  const handleRemoveWantedSkill = async (skill) => {
    try {
      const token = localStorage.getItem("token");
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
        showMessage(`Removed wanted skill: ${skill}`);
      }
    } catch (error) {
      showMessage("Failed to remove wanted skill", true);
    }
  };

  // Update distance matching preferences
  const handleUpdateDistancePreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      await updateDistancePreferences(useDistanceMatching, maxMatchDistance, token);
      showMessage("Distance preferences updated successfully!");
    } catch (error) {
      showMessage("Failed to update distance preferences", true);
    }
  };

  // Get and update user location
  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) {
      showMessage("Geolocation is not supported by this browser", true);
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
          showMessage("Location updated successfully!");
        } catch (error) {
          showMessage("Error updating location: " + error.message, true);
        }
      },
      (error) => {
        showMessage("Failed to get your location. Please enable location access.", true);
      }
    );
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="loading">Failed to load profile</div>;
  }

  return (
    <div className="container">
      <div className="page-container">
        {/* Back button */}
        <div className="nav-button">
          <button 
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1>My Profile</h1>
        
        {/* Status message */}
        {message && (
          <div className={message.includes("Error") || message.includes("Failed") ? "error-message" : "success-message"}>
            {message}
          </div>
        )}

        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h2>Basic Information</h2>
          </div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Skills Offered */}
        <div className="card">
          <h2>Skills I Offer</h2>
          <div style={{ marginBottom: "1rem" }}>
            {user.skillsOffered?.length ? (
              user.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="skill-tag offered"
                  onClick={() => handleRemoveOfferedSkill(skill)}
                  title="Click to remove"
                >
                  {skill} ×
                </span>
              ))
            ) : (
              <p style={{ color: "#7f8c8d" }}>No skills offered yet</p>
            )}
          </div>
          
          {/* Add offered skill input */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Add a skill you can offer"
              value={newOfferedSkill}
              onChange={(e) => setNewOfferedSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddOfferedSkill()}
              style={{ flex: 1 }}
            />
            <button 
              onClick={handleAddOfferedSkill}
              className="btn btn-success"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="card">
          <h2>Skills I Want to Learn</h2>
          <div style={{ marginBottom: "1rem" }}>
            {user.skillsWanted?.length ? (
              user.skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="skill-tag wanted"
                  onClick={() => handleRemoveWantedSkill(skill)}
                  title="Click to remove"
                >
                  {skill} ×
                </span>
              ))
            ) : (
              <p style={{ color: "#7f8c8d" }}>No skills wanted yet</p>
            )}
          </div>
          
          {/* Add wanted skill input */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Add a skill you want to learn"
              value={newWantedSkill}
              onChange={(e) => setNewWantedSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWantedSkill()}
              style={{ flex: 1 }}
            />
            <button 
              onClick={handleAddWantedSkill}
              className="btn btn-warning"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Distance Preferences */}
        <div className="card">
          <h2>Matching Preferences</h2>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useDistanceMatching}
                onChange={(e) => setUseDistanceMatching(e.target.checked)}
              />
              Enable distance-based matching
            </label>
          </div>

          {useDistanceMatching && (
            <div style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label>
                  Maximum distance for matches: 
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxMatchDistance}
                    onChange={(e) => setMaxMatchDistance(Number(e.target.value))}
                    style={{ marginLeft: "0.5rem", width: "80px" }}
                  />
                  km
                </label>
              </div>
              
              {/* Location status and update button */}
              <div className="form-group">
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#7f8c8d" }}>
                  Location status: {hasLocation ? "✅ Set" : "❌ Not set"}
                </p>
                
                <button 
                  onClick={handleUpdateLocation}
                  className={`btn ${hasLocation ? "btn-success" : "btn-primary"}`}
                >
                  {hasLocation ? "Update Location" : "Enable Location"}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={handleUpdateDistancePreferences}
            className="btn btn-primary"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;