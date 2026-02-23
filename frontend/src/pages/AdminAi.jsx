import { useState } from "react";
import { api } from "../api.jsx";

export default function AdminAI() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleIndex = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api("/ai/index", "POST", null, token);

      setMessage(res.message);
    } catch (err) {
      setMessage("Indexing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Knowledge Base</h2>

      <button onClick={handleIndex} disabled={loading}>
        {loading ? "Indexing..." : "Re-index Knowledge"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
