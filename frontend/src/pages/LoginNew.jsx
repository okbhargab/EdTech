import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.jsx";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if(!form.email || !form.password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      const data = await api("/auth/login", "POST", form);

      login(data.token, data.role, data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={submit}>
        <h2>Login to EdTech</h2>

        {error && <div style={{
          padding: "10px",
          marginBottom: "10px",
          background: "#fee",
          color: "#c00",
          borderRadius: "4px",
          border: "1px solid #fcc"
        }}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
