import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tests from "./pages/Tests.jsx";
import TestAttempt from "./pages/TestAttempt.jsx";
import Result from "./pages/Result.jsx";
import AdminAI from "./pages/AdminAi.jsx";
import AITutor from "./pages/AITutor.jsx";

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // can replace with spinner
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route path="/admin/ai" element={<AdminAI />} />


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
          path="/tests/:id"
          element={token ? <TestAttempt /> : <Navigate to="/" replace />}
        />

        <Route
          path="/ai"
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
