import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

function LoginPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="text-zinc-600">Hier kommt später dein Auth-Login hin.</p>
    </div>
  );
}

function DashboardPage() {
  const [message, setMessage] = useState("Lade...");
  const [health, setHealth] = useState("Lade...");

  useEffect(() => {
    const load = async () => {
      try {
        const helloRes = await fetch("http://localhost:4000/api/hello");
        const helloData = await helloRes.json();

        const healthRes = await fetch("http://localhost:4000/health");
        const healthData = await healthRes.json();

        setMessage(helloData.message);
        setHealth(healthData.ok ? "API online" : "API offline");
      } catch {
        setMessage("API nicht erreichbar");
        setHealth("Fehler");
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-600">
          Dein Control Panel für Services und API-Keys.
        </p>
      </div>

      <div className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Backend-Status</h2>
        <p className="text-zinc-700">{health}</p>
        <p className="mt-2 text-zinc-700">{message}</p>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-bold">jadenk-platform</p>
            <p className="text-sm text-zinc-500">API Dashboard + Gateway</p>
          </div>

          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Layout />;
}