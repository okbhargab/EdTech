import { Link } from "react-router-dom";

export default function Layout({ children }) {
  const role = localStorage.getItem("role");

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 40px",
          background: "#111827",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>AI Learning Platform</h2>

        <div style={{ display: "flex", gap: "16px" }}>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          <Link to="/tests" style={navLink}>Tests</Link>
          <Link to="/ai" style={navLink}>AI Tutor</Link>

          {role === "admin" && (
            <Link to="/admin/dashboard" style={navLink}>
              Admin
            </Link>
          )}
        </div>
      </nav>

      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const navLink = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
};