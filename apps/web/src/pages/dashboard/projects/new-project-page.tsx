import { Link } from "react-router-dom";
import { Card } from "../../../components/card";
import { ProjectForm } from "../../../components/project-form";

export function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Neues Projekt
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Lade Quellcode hoch und konfiguriere, wie dein API-Projekt gestartet werden soll.
          </p>
        </div>

        <Link
          to="/dashboard/projects"
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700"
        >
          Zurück
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card
          title="Projekt konfigurieren"
          description="Ohne Docker musst du Runtime, Startcommand und Port selbst sauber definieren."
        >
          <ProjectForm />
        </Card>

        <div className="space-y-6">
          <Card title="Wichtig">
            <ul className="space-y-3 text-sm leading-6 text-zinc-400">
              <li>Jedes Projekt braucht einen eindeutigen Port.</li>
              <li>Node- und Python-Projekte laufen als normale Prozesse.</li>
              <li>Dein Backend muss Start, Stop und Restart verwalten.</li>
              <li>Uploads sollten zuerst entpackt und geprüft werden.</li>
            </ul>
          </Card>

          <Card title="Beispiel Node">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
              <p><span className="text-zinc-500">runtime:</span> node</p>
              <p className="mt-2"><span className="text-zinc-500">entryFile:</span> server.js</p>
              <p className="mt-2"><span className="text-zinc-500">install:</span> npm install</p>
              <p className="mt-2"><span className="text-zinc-500">start:</span> node server.js</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}