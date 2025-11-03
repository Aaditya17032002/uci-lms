import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Sidebar } from "./layout/sidebar";

import { Header } from "./layout/header";

import { Footer } from "./layout/footer";

// Import Pages

import Dashboard from "./pages/page";
import LoginPage from "./pages/login";
import Timesheet from "./pages/timesheet/page";

import AddViewLeaves from "./pages/add-view-leaves/page";

import AssignApprover from "./pages/assign-approver/page";

import LeaveManagement from "./pages/leave-management/page";

import PendingApprovals from "./pages/pending-approvals/page";

import ManageEngagements from "./pages/manage-engagements/page";

import Reports from "./pages/reports/page";  // or wherever your reports live
import ClientLayout from "./pages/client-layout";
import { initializeMsal, ensureMsalLogin, fetchGraphProfile } from "./lib/msalClient";
import { apiClient } from "./lib/apiClient";

function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const sysEnv = (process.env.REACT_APP_SYS_ENV || "").toLowerCase();

  useEffect(() => {
    const run = async () => {
      // Only enforce Azure login in prod/qa
      if (sysEnv === "prod" || sysEnv === "qa") {
        await initializeMsal();
        const result = await ensureMsalLogin({ scopes: ["openid", "profile", "email", "User.Read"] });
        if (result?.account) {
          // Fetch profile from Graph and persist
          try {
            const profile = await fetchGraphProfile();
            if (profile.displayName) {
              sessionStorage.setItem("userName", profile.displayName);
              localStorage.setItem("userName", profile.displayName);
            }
            if (profile.email) {
              sessionStorage.setItem("userEmail", profile.email);
              // Notify backend for routing/authentication
              try {
                await apiClient.post("/auth/login", { email: profile.email });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log("[auth/login] failed:", e);
              }
            }
            if (profile.photoDataUrl) {
              sessionStorage.setItem("userPhoto", profile.photoDataUrl);
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log("[graph] profile fetch failed", e);
          }
          // On successful login, ensure we land on dashboard when at root
          if (window.location.pathname === "/" || window.location.pathname === "") {
            navigate("/dashboard", { replace: true });
          }
        }
      }
    };
    run();
  }, [navigate, sysEnv]);

  return <>{children}</>;
}

function App() {
  const sysEnv = (process.env.REACT_APP_SYS_ENV || "").toLowerCase();

  return (
    <Router>
      <AuthGate>
        <ClientLayout>
          <Routes>
            {/* In dev show login on root; in qa/prod redirect to dashboard */}
            <Route
              path="/"
              element={
                sysEnv === "prod" || sysEnv === "qa"
                  ? <Navigate to="/dashboard" replace />
                  : <LoginPage />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timesheet" element={<Timesheet />} />
            <Route path="/add-view-leaves" element={<AddViewLeaves />} />
            <Route path="/assign-approver" element={<AssignApprover />} />
            <Route path="/leave-management" element={<LeaveManagement />} />
            <Route path="/pending-approvals" element={<PendingApprovals />} />
            <Route path="/manage-engagements" element={<ManageEngagements />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>

          {/* Footer */}
          {/* <Footer /> */}
        </ClientLayout>
      </AuthGate>
    </Router>
  );

}

export default App;

