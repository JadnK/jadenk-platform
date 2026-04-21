export type ProjectRuntime = "node" | "python";
export type ProjectStatus = "running" | "stopped" | "building" | "failed";

export interface ProjectApiKey {
  id: string;
  name: string;
  keyPreview: string;
  keyHash: string;
  createdAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
}

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
  archivePath: string;
  pid?: number;
  createdAt: string;
  env: Record<string, string>;
  apiKeys: ProjectApiKey[];
}