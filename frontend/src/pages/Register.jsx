import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api("/auth/register", "POST", form);
      alert("Registered successfully");
      navigate("/"); // ✅ go to login page
    } catch (err) {
      console.error(err);
      alert("Email already exists or registration failed");
    }
  };

  return (
    <div className="container">
      <form onSubmit={submit}>
        <h2>Register</h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
