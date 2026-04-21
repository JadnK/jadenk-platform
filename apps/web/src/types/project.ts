export type ProjectRuntime = "node" | "python";
export type ProjectStatus = "running" | "stopped" | "building" | "failed";

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  runtime: ProjectRuntime;
  startCommand: string;
  installCommand: string;
  entryFile: string;
  port: number;
  status: ProjectStatus;
  description: string;
  createdAt: string;
}