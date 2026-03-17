import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, getRoleHome } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AuditPage from "./pages/AuditPage";
import HistoryPage from "./pages/HistoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAuditDetail from "./pages/admin/AdminAuditDetail";
import DesignerPortal from "./pages/DesignerPortal";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirects based on role */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Auditor routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["auditor"]}>
                <AppLayout><DashboardPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit/:id"
            element={
              <ProtectedRoute allowedRoles={["auditor", "admin"]}>
                <AppLayout><AuditPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["auditor"]}>
                <AppLayout><HistoryPage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audits"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminAuditDetail /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Designer routes */}
          <Route
            path="/designer"
            element={
              <ProtectedRoute allowedRoles={["designer"]}>
                <AppLayout><DesignerPortal /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
