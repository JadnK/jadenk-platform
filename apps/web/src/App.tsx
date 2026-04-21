import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { KeysPage } from "./pages/dashboard/keys-page";
import { LogsPage } from "./pages/dashboard/logs-page";
import { OverviewPage } from "./pages/dashboard/overview-page";
import { ServicesPage } from "./pages/dashboard/services-page";
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
        path="/dashboard/services"
        element={
          <DashboardLayout>
            <ServicesPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/dashboard/keys"
        element={
          <DashboardLayout>
            <KeysPage />
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