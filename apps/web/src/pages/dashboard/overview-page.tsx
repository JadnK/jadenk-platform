import { useEffect, useState } from "react";
import { Card } from "../../components/card";
import { apiGet } from "../../lib/api";

type HealthResponse = {
  ok: boolean;
  service: string;
};

type HelloResponse = {
  message: string;
};

export function OverviewPage() {
  const [status, setStatus] = useState("Lade...");
  const [message, setMessage] = useState("Lade...");

  useEffect(() => {
    const load = async () => {
      try {
        const health = await apiGet<HealthResponse>("/health");
        const hello = await apiGet<HelloResponse>("/api/hello");

        setStatus(health.ok ? "API online" : "API offline");
        setMessage(hello.message);
      } catch {
        setStatus("API nicht erreichbar");
        setMessage("Backend konnte nicht geladen werden");
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Übersicht
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Zentraler Überblick über deine Plattform, Services und API-Zugriffe.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Backend">
          <p className="text-2xl font-semibold text-zinc-50">{status}</p>
        </Card>

        <Card title="Message">
          <p className="text-sm text-zinc-300">{message}</p>
        </Card>

      </div>

      <Card
        title="Nächster Schritt"
        description="Als Nächstes bauen wir echte Service- und Key-Verwaltung auf diese Seiten."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Service Registry
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            API Key Management
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Request Logs
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Auth + Sessions
          </div>
        </div>
      </Card>
    </div>
  );
}