import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => pwd && pwd.length >= 6;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      if (!validateEmail(form.email)) {
        setError("Invalid email format");
        setLoading(false);
        return;
      }

      if (!validatePassword(form.password)) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      await api("/auth/register", "POST", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setError("");
      navigate("/"); // go to login page
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={submit}>
        <h2>Register for EdTech</h2>

        {error && <div style={{
          padding: "10px",
          marginBottom: "10px",
          background: "#fee",
          color: "#c00",
          borderRadius: "4px",
          border: "1px solid #fcc"
        }}>{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={loading}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </form>
    </div>
  );
}
