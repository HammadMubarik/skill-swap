export async function fetchMatchData(token) {
  console.log("Sending match request with token:", token); // <-- Add this

  const res = await fetch("http://localhost:5000/api/auth/match", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Raw response body:", text);
    throw new Error("Failed to fetch matches");
  }

  return await res.json();
}

export const addSkill = async (skill, token) => {
  const res = await fetch("http://localhost:5000/api/auth/add-skill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill }),
  });
  if (!res.ok) throw new Error("Failed to add skill");
  return res.json();
};

export const removeSkill = async (skill, token) => {
  const res = await fetch("http://localhost:5000/api/auth/remove-skill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill }),
  });
  if (!res.ok) throw new Error("Failed to remove skill");
  return res.json();
};

export const registerUser = async (formData) => {
  const payload = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    skillsOffered: formData.skillsOffered
      .split(",")
      .map((skill) => skill.trim())
      .filter((s) => s),
    skillsWanted: formData.skillsWanted
      .split(",")
      .map((skill) => skill.trim())
      .filter((s) => s),
    useDistanceMatching: formData.useDistanceMatching,
    maxMatchDistance: formData.maxMatchDistance,
    latitude: formData.latitude,
    longitude: formData.longitude
  };

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

export const updateDistancePreferences = async (useDistanceMatching, maxMatchDistance, token) => {
  const res = await fetch("http://localhost:5000/api/auth/update-distance-preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ useDistanceMatching, maxMatchDistance }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update distance preferences");
  }
  
  return res.json();
};

export const getUserProfile = async (token) => {
  const res = await fetch("http://localhost:5000/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch user profile");
  }
  
  return res.json();
};

export const updateUserLocation = async (latitude, longitude, token) => {
  const res = await fetch("http://localhost:5000/api/auth/update-location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update location");
  }
  
  return res.json();
};