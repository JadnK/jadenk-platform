import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { DeploymentsPage } from "./pages/dashboard/deployments-page";
import { LogsPage } from "./pages/dashboard/logs-page";
import { OverviewPage } from "./pages/dashboard/overview-page";
import { ProjectsPage } from "./pages/dashboard/projects-page";
import { NewProjectPage } from "./pages/dashboard/projects/new-project-page";
import { SettingsPage } from "./pages/dashboard/settings-page";
import { LoginPage } from "./pages/login-page";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <OverviewPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/projects"
        element={
          <DashboardLayout>
            <ProjectsPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/projects/new"
        element={
          <DashboardLayout>
            <NewProjectPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/deployments"
        element={
          <DashboardLayout>
            <DeploymentsPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/logs"
        element={
          <DashboardLayout>
            <LogsPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}