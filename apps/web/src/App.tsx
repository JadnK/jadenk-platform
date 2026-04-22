import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./components/auth-guard";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { DeploymentsPage } from "./pages/dashboard/deployments-page";
import { LogsPage } from "./pages/dashboard/logs-page";
import { OverviewPage } from "./pages/dashboard/overview-page";
import { NewProjectPage } from "./pages/dashboard/projects/new-project-page";
import { ProjectsPage } from "./pages/dashboard/projects-page";
import { ProjectKeysPage } from "./pages/dashboard/project-keys-page";
import { LoginPage } from "./pages/login-page";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardLayout>
              <OverviewPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard/projects"
        element={
          <AuthGuard>
            <DashboardLayout>
              <ProjectsPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard/projects/new"
        element={
          <AuthGuard>
            <DashboardLayout>
              <NewProjectPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard/deployments"
        element={
          <AuthGuard>
            <DashboardLayout>
              <DeploymentsPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard/keys"
        element={
          <AuthGuard>
            <DashboardLayout>
              <ProjectKeysPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard/logs"
        element={
          <AuthGuard>
            <DashboardLayout>
              <LogsPage />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}