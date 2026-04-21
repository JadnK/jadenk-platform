import { Link } from "react-router-dom";
import { Card } from "../../components/card";
import { ProjectCard } from "../../components/project-card";
import { mockProjects } from "../../data/mock-projects";

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Deine Projekte
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Verwalte hochgeladene APIs, Runtime-Einstellungen und laufende Prozesse.
          </p>
        </div>

        <Link
          to="/dashboard/projects/new"
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          Neues Projekt
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Gesamt">
          <p className="text-3xl font-semibold text-zinc-50">
            {mockProjects.length}
          </p>
        </Card>

        <Card title="Running">
          <p className="text-3xl font-semibold text-zinc-50">
            {mockProjects.filter((project) => project.status === "running").length}
          </p>
        </Card>

        <Card title="Stopped">
          <p className="text-3xl font-semibold text-zinc-50">
            {mockProjects.filter((project) => project.status === "stopped").length}
          </p>
        </Card>

        <Card title="Building / Failed">
          <p className="text-3xl font-semibold text-zinc-50">
            {
              mockProjects.filter(
                (project) =>
                  project.status === "building" || project.status === "failed",
              ).length
            }
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}