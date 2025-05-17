import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import TenantSelectPage from "./pages/TenantSelectPage";
import DashboardPage from "./pages/DashboardPage";
import { useEffect, useState } from "react";
import { isLoginDomain, isTenantDomain } from "./lib/domain";
import TenantDashboard from "./pages/tenant-dashboard-page";

// Main app component
function AppRoutes() {
  // Create state for domain detection
  const [onTenantDomain, setOnTenantDomain] = useState(false);
  const [onLoginDomain, setOnLoginDomain] = useState(false);

  // Update domain state when app loads
  useEffect(() => {
    const tenantDomain = isTenantDomain();
    const loginDomain = isLoginDomain();

    setOnTenantDomain(tenantDomain);
    setOnLoginDomain(loginDomain);

    console.log("App domain detection:", {
      tenantDomain,
      loginDomain,
      hostname: window.location.hostname,
    });
  }, []);

  if (onTenantDomain) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requireLogin={false} requireTenant={true}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute requireLogin={false} requireTenant={true}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Login domain routes */}
      {onLoginDomain && (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/select-tenant"
            element={
              <ProtectedRoute requireLogin={true} requireTenant={false}>
                <TenantSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute requireLogin={true} requireTenant={false}>
                <TenantSelectPage />
              </ProtectedRoute>
            }
          />
        </>
      )}

      {/* Tenant domain routes */}
      {onTenantDomain && (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requireLogin={true} requireTenant={true}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Add tenant-specific routes that don't require auth */}
          <Route path="/auth/callback" element={<LoginPage />} />
        </>
      )}

      {/* Routes for any domain (fallback) */}
      {!onLoginDomain && !onTenantDomain && (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requireLogin={true} requireTenant={false}>
                <TenantSelectPage />
              </ProtectedRoute>
            }
          />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
