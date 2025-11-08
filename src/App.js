import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import ReportCrime from "./pages/ReportCrime";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import MapPage from './pages/Map';

import { isAuthenticated } from "./utils/auth";

function App() {
  const auth = isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={auth ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={auth ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/report"
          element={
            <RoleProtectedRoute
              allowedRoles={["citizen", "tourist", "police", "admin"]}
            >
              <ReportCrime />
            </RoleProtectedRoute>
          }
        />
        <Route path="/map" element={<MapPage />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* 🔒 General protected route (for all logged-in users) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Example: Police/Admin-only route */}
        <Route
          path="/manage-crimes"
          element={
            <RoleProtectedRoute allowedRoles={["police", "admin"]}>
              <div className="p-10 text-xl font-bold">
                Crime Management Portal 🚔
              </div>
            </RoleProtectedRoute>
          }
        />

        {/* 🔒 Example: Admin-only route */}
        <Route
          path="/admin-panel"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <div className="p-10 text-xl font-bold">
                Admin Control Center ⚙️
              </div>
            </RoleProtectedRoute>
          }
        />

        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={auth ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
