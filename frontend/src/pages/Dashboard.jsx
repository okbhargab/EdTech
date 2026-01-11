import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { logout } from "../logout.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);

useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    api("/me", "GET", null, token)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        logout(); // removes token + reloads
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <p><strong>User ID:</strong> {user.id}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <button
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          cursor: "pointer",
        }}
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
