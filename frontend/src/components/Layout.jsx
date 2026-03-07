import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { logout } from "../logout.js";

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 40px",
          background: "#111827",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>AI Learning Platform</h2>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          <Link to="/tests" style={navLink}>Tests</Link>
          <Link to="/ai" style={navLink}>AI Tutor</Link>

          {user?.role === "admin" && (
            <Link to="/admin/dashboard" style={navLink}>
              Admin
            </Link>
          )}
          
          <button onClick={logout} style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9em"
          }}>
            Logout
          </button>
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