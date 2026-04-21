import { Card } from "../../components/card";

export function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Logs
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Request Logs
        </h1>
      </div>

      <Card
        title="Aktivität"
        description="Hier landen später Gateway-Requests, Fehler und Nutzungsdaten."
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          Noch keine Logs vorhanden.
        </div>
      </Card>
    </div>
  );
}