import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate("/");
      return;
    }

    // Fetch analytics
    Promise.all([
      api("/analytics/summary", "GET", null, token),
      api("/analytics/trends", "GET", null, token)
    ])
      .then(([analyticsData, trendsData]) => {
        setAnalytics(analyticsData);
        setTrends(trendsData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analytics");
      });
  }, [token, authLoading, navigate]);

  if (authLoading || !analytics || !trends) return <Layout><p>Loading analytics...</p></Layout>;

  return (
    <Layout>
      <h2>Dashboard</h2>
      
      {error && <div style={{
        padding: "10px",
        marginBottom: "10px",
        background: "#fee",
        color: "#c00",
        borderRadius: "4px",
        border: "1px solid #fcc"
      }}>Error: {error}</div>}
      
      <div style={{ marginBottom: "20px" }}>
        <Link to="/tests"><button style={{ marginRight: "10px" }}>Take Test</button></Link>
        <Link to="/ai"><button style={{ marginRight: "10px" }}>Ask AI Tutor</button></Link>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3>Your Analytics</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginTop: "16px",
      }}>
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
    </Layout>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
        color: "white",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      }}
    >
      <p style={{ opacity: 0.8 }}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}
