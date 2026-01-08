const BASE = import.meta.env.VITE_API_BASE;

export const api = async (url, method, body, token) => {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
};
