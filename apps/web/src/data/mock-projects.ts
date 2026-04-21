import type { ProjectItem } from "../types/project";

export const mockProjects: ProjectItem[] = [
  {
    id: "proj_1",
    name: "Mail API",
    slug: "mail",
    runtime: "node",
    startCommand: "node server.js",
    installCommand: "npm install",
    entryFile: "server.js",
    port: 4010,
    status: "running",
    description: "Mail API mit Node.js",
    createdAt: "2026-04-21",
  },
  {
    id: "proj_2",
    name: "Weather API",
    slug: "weather",
    runtime: "python",
    startCommand: "python main.py",
    installCommand: "pip install -r requirements.txt",
    entryFile: "main.py",
    port: 4011,
    status: "stopped",
    description: "Weather API mit Python",
    createdAt: "2026-04-21",
  },
];