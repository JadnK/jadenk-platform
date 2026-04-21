export type ProjectRuntime = "node" | "python";
export type ProjectStatus = "running" | "stopped" | "building" | "failed";

export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  runtime: ProjectRuntime;
  entryFile: string;
  installCommand: string;
  startCommand: string;
  port: number;
  status: ProjectStatus;
  description: string;
  projectPath: string;
  pid?: number;
  createdAt: string;
}