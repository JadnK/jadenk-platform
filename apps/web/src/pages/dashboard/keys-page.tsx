import { Card } from "../../components/card";

export function KeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          API Keys
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Schlüsselverwaltung
        </h1>
      </div>

      <Card
        title="Keys"
        description="Später generierst, deaktivierst und rotierst du hier API Keys."
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          Noch keine echten Keys angebunden.
        </div>
      </Card>
    </div>
  );
}