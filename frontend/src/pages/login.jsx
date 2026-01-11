import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const data = await api("/auth/login", "POST", form);

      // 🔴 THIS IS CRITICAL
      localStorage.setItem("token", data.token);

      // ✅ move to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="container">
      <form onSubmit={submit}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit">Login</button>

        <p>
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
