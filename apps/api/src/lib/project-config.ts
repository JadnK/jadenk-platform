import fs from "node:fs";
import path from "node:path";
import { runtimePaths } from "./runtime-paths";
import type { ProjectRecord, ProjectStatus } from "../types/project";

export interface ProjectState {
  status: ProjectStatus;
  pid: number | null;
  lastStartedAt: string | null;
  lastStoppedAt: string | null;
  lastError: string | null;
}

export function getProjectRoot(projectId: string) {
  return path.join(runtimePaths.projectsRoot, projectId);
}

export function getProjectConfigPath(projectId: string) {
  return path.join(getProjectRoot(projectId), "project.config.json");
}

export function getProjectStatePath(projectId: string) {
  return path.join(getProjectRoot(projectId), "state.json");
}

export async function writeProjectConfig(project: ProjectRecord) {
  const filePath = getProjectConfigPath(project.id);
  await fs.promises.writeFile(filePath, JSON.stringify(project, null, 2), "utf-8");
}

export async function readProjectConfig(projectId: string): Promise<ProjectRecord | null> {
  const filePath = getProjectConfigPath(projectId);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = await fs.promises.readFile(filePath, "utf-8");
  const parsed = JSON.parse(content) as Partial<ProjectRecord>;

  return {
    id: parsed.id ?? projectId,
    name: parsed.name ?? "",
    slug: parsed.slug ?? "",
    runtime: (parsed.runtime ?? "node") as ProjectRecord["runtime"],
    entryFile: parsed.entryFile ?? "",
    installCommand: parsed.installCommand ?? "",
    startCommand: parsed.startCommand ?? "",
    port: parsed.port ?? 4010,
    status: (parsed.status ?? "stopped") as ProjectRecord["status"],
    description: parsed.description ?? "",
    projectPath: parsed.projectPath ?? "",
    archivePath: parsed.archivePath ?? "",
    pid: parsed.pid,
    createdAt: parsed.createdAt ?? new Date().toISOString(),
    apiKeys: Array.isArray(parsed.apiKeys) ? parsed.apiKeys : [],
    autoStart: parsed.autoStart ?? true,
  };
}

export async function writeProjectState(projectId: string, state: ProjectState) {
  const filePath = getProjectStatePath(projectId);
  await fs.promises.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
}

export async function readProjectState(projectId: string): Promise<ProjectState | null> {
  const filePath = getProjectStatePath(projectId);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(content) as ProjectState;
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  if (!fs.existsSync(runtimePaths.projectsRoot)) {
    return [];
  }

  const entries = await fs.promises.readdir(runtimePaths.projectsRoot, {
    withFileTypes: true,
  });

  const projects: ProjectRecord[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const config = await readProjectConfig(entry.name);
    if (config) {
      projects.push(config);
    }
  }

  return projects;
}

export async function getProjectById(projectId: string) {
  const project = await readProjectConfig(projectId);
  if (!project) return null;

  const state = await readProjectState(projectId);

  return {
    ...project,
    status: state?.status ?? "stopped",
    pid: state?.pid ?? undefined,
  };
}

export async function getProjectBySlug(slug: string) {
  const projects = await getAllProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) return null;

  const state = await readProjectState(project.id);

  return {
    ...project,
    status: state?.status ?? "stopped",
    pid: state?.pid ?? undefined,
  };
}