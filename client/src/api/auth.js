export async function fetchMatchData(token) {
  const res = await fetch("http://localhost:5000/api/auth/match", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

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
