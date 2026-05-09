import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";

import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tests from "./pages/Tests.jsx";
import TestAttempt from "./pages/TestAttempt.jsx";
import Result from "./pages/Result.jsx";
import Profile from "./pages/Profile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AdminAI from "./pages/AdminAi.jsx";
import AITutor from "./pages/AITutor.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />


        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" replace />}
        />

        <Route
          path="/tests"
          element={token ? <Tests /> : <Navigate to="/" replace />}
        />

        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/" replace />}
        />

        <Route
          path="/leaderboard"
          element={token ? <Leaderboard /> : <Navigate to="/" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={token ? <AdminDashboard /> : <Navigate to="/" replace />}
        />

        <Route
          path="/tests/:id"
          element={token ? <TestAttempt /> : <Navigate to="/" replace />}
        />

        <Route
          path="/ai-tutor"
          element={token ? <AITutor /> : <Navigate to="/" replace />}
        />

        <Route
          path="/result/:id" 
          element={token ? <Result /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
