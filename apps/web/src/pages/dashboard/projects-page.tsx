import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/card";
import { ProjectCard } from "../../components/project-card";
import { apiGet, apiPost } from "../../lib/api";
import type { ProjectItem } from "../../types/project";

type ProjectsResponse = {
  projects: ProjectItem[];
};

type RuntimeActionResponse = {
  message: string;
  pid?: number;
};

type ActiveAction =
  | {
      projectId: string;
      type: "start" | "stop" | "restart";
    }
  | null;

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const loadProjects = async () => {
    try {
      const data = await apiGet<ProjectsResponse>("/projects");
      setProjects(data.projects);
      setError("");
    } catch {
      setError("Projekte konnten nicht geladen werden.");
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const runAction = async (
    projectId: string,
    type: "start" | "stop" | "restart",
  ) => {
    try {
      setActiveAction({ projectId, type });
      await apiPost<RuntimeActionResponse>(`/projects/${projectId}/${type}`);
      await loadProjects();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Aktion fehlgeschlagen.";
      setError(message);
    } finally {
      setActiveAction(null);
    }
  };

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

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Gesamt">
          <p className="text-3xl font-semibold text-zinc-50">{projects.length}</p>
        </Card>

        <Card title="Running">
          <p className="text-3xl font-semibold text-zinc-50">
            {projects.filter((project) => project.status === "running").length}
          </p>
        </Card>

        <Card title="Stopped">
          <p className="text-3xl font-semibold text-zinc-50">
            {projects.filter((project) => project.status === "stopped").length}
          </p>
        </Card>

        <Card title="Building / Failed">
          <p className="text-3xl font-semibold text-zinc-50">
            {
              projects.filter(
                (project) =>
                  project.status === "building" || project.status === "failed",
              ).length
            }
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onStart={(projectId) => void runAction(projectId, "start")}
            onStop={(projectId) => void runAction(projectId, "stop")}
            onRestart={(projectId) => void runAction(projectId, "restart")}
            activeAction={activeAction}
          />
        ))}
      </div>

      {!projects.length && !error ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-6 text-sm text-zinc-400">
          Noch keine Projekte vorhanden.
        </div>
      ) : null}
    </div>
  );
}