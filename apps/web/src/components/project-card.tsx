import { Link } from "react-router-dom";
import { RuntimeBadge } from "./runtime-badge";
import { StatusBadge } from "./status-badge";
import type { ProjectItem } from "../types/project";

interface ProjectCardProps {
  project: ProjectItem;
  onStart?: (projectId: string) => void;
  onStop?: (projectId: string) => void;
  onRestart?: (projectId: string) => void;
  activeAction?: {
    projectId: string;
    type: "start" | "stop" | "restart";
  } | null;
}

export function ProjectCard({
  project,
  onStart,
  onStop,
  onRestart,
  activeAction = null,
}: ProjectCardProps) {
  const isStarting =
    activeAction?.projectId === project.id && activeAction.type === "start";
  const isStopping =
    activeAction?.projectId === project.id && activeAction.type === "stop";
  const isRestarting =
    activeAction?.projectId === project.id && activeAction.type === "restart";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">/{project.slug}</p>
        </div>

        <StatusBadge status={project.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <RuntimeBadge runtime={project.runtime} />
        <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
          Port {project.port}
        </span>
        {project.pid ? (
          <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
            PID {project.pid}
          </span>
        ) : null}
        
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
          Public URL
        </p>
        <p className="mt-2 break-all text-sm text-zinc-300">
          http://localhost:4000/v1/{project.slug}
        </p>
      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Start Command
          </p>
          <p className="mt-2 break-all text-sm text-zinc-300">
            {project.startCommand}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Entry File
          </p>
          <p className="mt-2 break-all text-sm text-zinc-300">
            {project.entryFile}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onStart?.(project.id)}
          disabled={isStarting || project.status === "running"}
          className="rounded-xl bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting ? "Startet..." : "Starten"}
        </button>

        <button
          type="button"
          onClick={() => onStop?.(project.id)}
          disabled={isStopping || project.status !== "running"}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStopping ? "Stoppt..." : "Stoppen"}
        </button>

        <button
          type="button"
          onClick={() => onRestart?.(project.id)}
          disabled={isRestarting}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRestarting ? "Restart..." : "Restart"}
        </button>

        <Link
          to={`/dashboard/deployments?projectId=${project.id}`}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-700"
        >
          Logs ansehen
        </Link>
      </div>
    </div>
  );
}