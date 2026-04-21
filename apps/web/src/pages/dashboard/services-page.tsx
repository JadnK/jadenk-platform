import { Card } from "../../components/card";

const mockServices = [
  { name: "Mail API", runtime: "node", status: "active" },
  { name: "Weather API", runtime: "python", status: "active" },
  { name: "Image API", runtime: "python", status: "draft" },
];

export function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Services
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Deine Dienste
        </h1>
      </div>

      <Card
        title="Service Registry"
        description="Hier werden später alle registrierten Ziel-APIs verwaltet."
      >
        <div className="space-y-3">
          {mockServices.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4"
            >
              <div>
                <p className="font-medium text-zinc-100">{service.name}</p>
                <p className="text-sm text-zinc-500">{service.runtime}</p>
              </div>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}