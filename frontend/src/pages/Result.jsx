import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import Layout from "../components/Layout.jsx";

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    api(`/tests/${id}/result`, "GET", null, token)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <Layout><p>Loading result...</p></Layout>;
  if (!result) return <Layout><p>No result found.</p></Layout>;

  return (
  <Layout>
    <h2>Test Result</h2>

    <p><strong>Score:</strong> {result.score}</p>

    <p>
      <strong>Submitted at:</strong>{" "}
      {new Date(result.submitted_at).toLocaleString()}
    </p>

    <div style={{ marginTop: "20px" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginRight: "10px", padding: "8px 16px" }}
      >
        Back to Dashboard
      </button>

      <button
        onClick={() => navigate("/tests")}
        style={{ padding: "8px 16px" }}
      >
        Take Another Test
      </button>
    </div>
  </Layout>
);
}
