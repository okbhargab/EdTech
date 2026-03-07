import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import { Link } from "react-router-dom";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    
    api("/tests", "GET", null, token)
      .then(setTests)
      .catch(err => setError(err.message || "Failed to load tests"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Layout><p>Loading tests...</p></Layout>;
  if (error) return <Layout>
    <div style={{
      padding: "10px",
      background: "#fee",
      color: "#c00",
      borderRadius: "4px",
      border: "1px solid #fcc"
    }}>Error: {error}</div>
  </Layout>;

  return (
    <Layout>
      <h2>Available Tests</h2>
      {tests.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
          No tests available yet. Check back soon!
        </p>
      ) : (
        <div>
          {tests.map(t => (
            <div key={t.id} className="card" style={{
              background: "#fff",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              boxShadow: "0 1px 5px rgba(0,0,0,0.08)"
            }}>
              <h4 style={{ marginBottom: "8px" }}>{t.title}</h4>
              <p style={{ color: "#666", marginBottom: "10px" }}>{t.description}</p>
              <Link to={`/tests/${t.id}`}>
                <button>Take Test</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
