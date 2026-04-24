// 1. Fixed the (data) parameter
export const createAlert = async (data) => {
  const res = await fetch("http://localhost:5000/api/alert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
};

// 2. Also add this one below it for your Dashboard
export const getAlerts = async () => {
  const res = await fetch("http://localhost:5000/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
};

export const updateAlertStatus = async (id, status) => {
  const res = await fetch(`http://localhost:5000/api/alert/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};
