import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/card";
import { apiGet } from "../../lib/api";
import type { ProjectItem } from "../../types/project";

type ProjectsResponse = {
  projects: ProjectItem[];
};

type LogsResponse = {
  logs: string;
};

export function DeploymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [logs, setLogs] = useState("");
  const [error, setError] = useState("");
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const selectedProjectId = searchParams.get("projectId") || "";

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiGet<ProjectsResponse>("/projects");
        setProjects(data.projects);

        if (!selectedProjectId && data.projects.length > 0) {
          setSearchParams({ projectId: data.projects[0].id });
        }
      } catch {
        setError("Projekte konnten nicht geladen werden.");
      }
    };

    void loadProjects();
  }, [selectedProjectId, setSearchParams]);

  useEffect(() => {
    const loadLogs = async () => {
      if (!selectedProjectId) return;

      try {
        setIsLoadingLogs(true);
        const data = await apiGet<LogsResponse>(`/projects/${selectedProjectId}/logs`);
        setLogs(data.logs || "");
        setError("");
      } catch {
        setError("Logs konnten nicht geladen werden.");
      } finally {
        setIsLoadingLogs(false);
      }
    };

    void loadLogs();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;

    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const data = await apiGet<LogsResponse>(`/projects/${selectedProjectId}/logs`);
          setLogs(data.logs || "");

          const projectData = await apiGet<ProjectsResponse>("/projects");
          setProjects(projectData.projects);
        } catch {
          // absichtlich still
        }
      })();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [selectedProjectId]);

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Deployments
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Logs & Runtime
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Schau dir Output, Fehler und Laufzeitinfos deiner gestarteten Projekte an.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card
          title="Projekte"
          description="Wähle ein Projekt aus, um die aktuellen Logs zu sehen."
        >
          <div className="space-y-3">
            {projects.map((project) => {
              const isActive = project.id === selectedProjectId;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSearchParams({ projectId: project.id })}
                  className={[
                    "w-full rounded-2xl border px-4 py-4 text-left transition",
                    isActive
                      ? "border-zinc-700 bg-zinc-950 text-zinc-50"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700",
                  ].join(" ")}
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">/{project.slug}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {project.runtime} · {project.status}
                  </p>
                </button>
              );
            })}

            {!projects.length ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-400">
                Keine Projekte vorhanden.
              </div>
            ) : null}
          </div>
        </Card>

        <Card
          title={selectedProject ? `${selectedProject.name} Logs` : "Logs"}
          description={
            selectedProject
              ? `Port ${selectedProject.port} · ${selectedProject.runtime}`
              : "Wähle links ein Projekt aus."
          }
        >
          <div className="mb-4 flex flex-wrap gap-3 text-sm text-zinc-400">
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1">
              Status: {selectedProject?.status || "-"}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1">
              PID: {selectedProject?.pid || "-"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black p-4">
            <pre className="min-h-[420px] whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-300">
              {isLoadingLogs
                ? "Lade Logs..."
                : logs || "Noch keine Logs vorhanden."}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}