const API_BASE = "http://localhost:5000/api/auth";

export const fetchMatches = async (token) => {
  const res = await fetch(`${API_BASE}/match`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const addSkill = async (token, skill) => {
  const res = await fetch(`${API_BASE}/add-skill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill }),
  });
  return res.json();
};

export const removeSkill = async (token, skill) => {
  const res = await fetch(`${API_BASE}/remove-skill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill }),
  });
  return res.json();
};
