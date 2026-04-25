const BASE = "http://localhost:5001/api"; // Moved to 5001 to avoid ghost server conflict

// ─── ALERTS ────────────────────────────────────────────────────────────────

export const createAlert = async (data) => {
  // Attach systemId from localStorage if available (backward compatible)
  const systemId = localStorage.getItem("sers_system_id") || "default";
  const res = await fetch(`${BASE}/alert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, systemId }),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
};

export const getAlerts = async () => {
  // Filter by systemId if set, otherwise return all (backward compatible)
  const systemId = localStorage.getItem("sers_system_id");
  const url = systemId
    ? `${BASE}/alerts?systemId=${systemId}`
    : `${BASE}/alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
};

export const updateAlertStatus = async (id, status) => {
  const res = await fetch(`${BASE}/alert/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const generateZones = async (type, description) => {
  console.log(">>> [Browser] Calling AI Zone Generation...");
  const res = await fetch(`${BASE}/ai/generate-zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, description }),
  });
  return res.json();
};

export const getAISuggestions = async () => {
  const systemId = localStorage.getItem("sers_system_id");
  if (!systemId) return [];
  const res = await fetch(`${BASE}/system/${systemId}/ai-suggestions`);
  if (!res.ok) throw new Error("Failed to fetch AI suggestions");
  return res.json();
};

// ─── STAFF ────────────────────────────────────────────────────────────────

export const getAllStaff = async () => {
  const systemId = localStorage.getItem("sers_system_id");
  const url = systemId ? `${BASE}/staff?systemId=${systemId}` : `${BASE}/staff`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch staff");
  return res.json();
};

export const addStaff = async (data) => {
  const systemId = localStorage.getItem("sers_system_id") || "default";
  const res = await fetch(`${BASE}/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, systemId }),
  });
  if (!res.ok) throw new Error("Failed to add staff");
  return res.json();
};

export const loginStaff = async (email, password) => {
  const res = await fetch(`${BASE}/staff/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  return res.json();
};

// ─── SYSTEM ────────────────────────────────────────────────────────────────

export const createSystem = async (data, adminPassword) => {
  console.log(">>> [Browser] Calling Create System...");
  const res = await fetch(`${BASE}/system`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, adminPassword }), // Correctly merge password
  });
  if (!res.ok) throw new Error("Failed to create system");
  return res.json();
};

export const deleteStaff = async (id) => {
  const res = await fetch(`${BASE}/staff/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete staff");
  return res.json();
};

export const enterSystem = async (accessCode, email) => {
  const res = await fetch(`${BASE}/system/enter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode, email }),
  });
  if (!res.ok) throw new Error("System not found or error entering");
  return res.json();
};
export const updateSystemSettings = async (id, settings) => {
  const res = await fetch(`${BASE}/system/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
};
