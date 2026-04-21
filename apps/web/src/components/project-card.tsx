import { RuntimeBadge } from "./runtime-badge";
import { StatusBadge } from "./status-badge";
import type { ProjectItem } from "../types/project";

interface ProjectCardProps {
  project: ProjectItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
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
    </div>
  );
}