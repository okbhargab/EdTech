import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api("/me", "GET", null, localStorage.getItem("token"))
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>User ID: {user.id}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
