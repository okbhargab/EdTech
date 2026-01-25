import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { logout } from "../logout.js";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);


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

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token) return;

    api("/analytics/summary","GET",null,token).then((data)=>{
      setAnalytics(data);
    })
    .catch((err)=>{
      console.log("Analytics fetch failed",err);
    });

  },[]
);
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  api("/analytics/trends", "GET", null, token)
    .then(setTrends)
    .catch(console.error);
}, []);


  if (!user || !analytics ||!trends) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <p><strong>User ID:</strong> {user.id}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Analytics</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        <StatCard title="Tests Taken" value={analytics.totalTestsTaken} />
        <StatCard title="Average Score" value={analytics.averageScore} />
        <StatCard title="Best Score" value={analytics.bestScore} />
        <StatCard
          title="Last Attempt"
          value={
            analytics.lastAttempt
              ? new Date(analytics.lastAttempt).toLocaleString()
              : "No attempts yet"
          }
        />
      </div>
      <h3 style={{ marginTop: "32px" }}>Attempts Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trends.attemptsOverTime}>
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line dataKey="count" stroke="#2563eb" />
      </LineChart>
    </ResponsiveContainer>

    <h3 style={{ marginTop: "32px" }}>Average Score Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trends.scoreTrend}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line dataKey="averageScore" stroke="#16a34a" />
      </LineChart>
    </ResponsiveContainer>
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

function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ color: "#555", marginBottom: "8px" }}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}

