import { Card } from "../../components/card";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Einstellungen
        </h1>
      </div>

      <Card
        title="Projekt"
        description="Später kommen hier Account-, Domain- und Security-Einstellungen rein."
      >
      </Card>
    </div>
  );
}