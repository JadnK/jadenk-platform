import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { projects } from "../lib/project-store";
import { ensureDir, extractZip, saveBufferToFile } from "../lib/project-files";
import { runtimePaths } from "../lib/runtime-paths";
import { createProjectId, normalizeSlug } from "../lib/project-utils";
import type { ProjectRecord, ProjectRuntime } from "../types/project";
import { startProjectProcess } from "../runtime/process-manager";
import { runCommand } from "../runtime/command-runner";
import {
  getRunningProcess,
  startProjectProcess,
  stopProjectProcess,
} from "../runtime/process-manager";
import {
  createApiKeyId,
  generateRawApiKey,
  getApiKeyPreview,
  hashApiKey,
} from "../lib/api-keys";


export async function projectRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      projects,
    };
  });

  app.post("/", async (request, reply) => {
    const parts = request.parts();

    let name = "";
    let slug = "";
    let runtime = "node" as ProjectRuntime;
    let entryFile = "";
    let installCommand = "";
    let startCommand = "";
    let description = "";
    let port = 4010;
    let zipBuffer: Buffer | null = null;
    let zipFilename = "project.zip";

    for await (const part of parts) {
      if (part.type === "file") {
        zipFilename = part.filename || "project.zip";
        zipBuffer = await part.toBuffer();
        continue;
      }

      if (part.type === "field") {
        const value = String(part.value);

        switch (part.fieldname) {
          case "name":
            name = value;
            break;
          case "slug":
            slug = value;
            break;
          case "runtime":
            runtime = value as ProjectRuntime;
            break;
          case "entryFile":
            entryFile = value;
            break;
          case "installCommand":
            installCommand = value;
            break;
          case "startCommand":
            startCommand = value;
            break;
          case "description":
            description = value;
            break;
          case "port":
            port = Number(value);
            break;
        }
      }
    }

    const normalizedSlug = normalizeSlug(slug || name);

    if (!name || !normalizedSlug || !entryFile || !startCommand || !zipBuffer) {
      return reply.status(400).send({
        error:
          "name, slug, entryFile, startCommand und zip-Datei sind erforderlich",
      });
    }

    const slugExists = projects.some((project) => project.slug === normalizedSlug);
    if (slugExists) {
      return reply.status(409).send({
        error: "Slug existiert bereits",
      });
    }

    const projectId = createProjectId();
    const projectRoot = path.join(runtimePaths.projectsRoot, projectId);
    const archivePath = path.join(
      runtimePaths.uploadsRoot,
      `${projectId}-${zipFilename}`,
    );
    const sourcePath = path.join(projectRoot, "current");

    await ensureDir(runtimePaths.projectsRoot);
    await ensureDir(runtimePaths.uploadsRoot);
    await ensureDir(runtimePaths.logsRoot);
    await ensureDir(projectRoot);

    await saveBufferToFile(archivePath, zipBuffer);
    await extractZip(archivePath, sourcePath);

    let finalPath = sourcePath;
    const entries = await fs.promises.readdir(sourcePath);

    if (entries.length === 1) {
      const maybeDir = path.join(sourcePath, entries[0]);
      const stat = await fs.promises.stat(maybeDir);

      if (stat.isDirectory()) {
        finalPath = maybeDir;
      }
    }

    const project: ProjectRecord = {
      id: projectId,
      name,
      slug: normalizedSlug,
      runtime,
      entryFile,
      installCommand,
      startCommand,
      port,
      status: "stopped",
      description,
      projectPath: finalPath,
      archivePath,
      createdAt: new Date().toISOString(),
      apiKeys: [],
    };

    projects.push(project);

    return reply.status(201).send({
      message: "Projekt erstellt",
      project,
    });
  });

  app.get("/:id/logs", async (request) => {
    const { id } = request.params as { id: string };

    const logPath = path.join(runtimePaths.logsRoot, `${id}.log`);

    if (!fs.existsSync(logPath)) {
      return { logs: "" };
    }

    const content = await fs.promises.readFile(logPath, "utf-8");

    return {
      logs: content,
    };
  });

  app.get("/:id/keys", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = projects.find((p) => p.id === id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    return {
      keys: project.apiKeys,
    };
  });

  app.post("/:id/keys", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { name?: string };

    const project = projects.find((p) => p.id === id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const rawKey = generateRawApiKey();
    const apiKey = {
      id: createApiKeyId(),
      name: body.name?.trim() || "Default Key",
      keyPreview: getApiKeyPreview(rawKey),
      keyHash: hashApiKey(rawKey),
      createdAt: new Date().toISOString(),
    };

    project.apiKeys.push(apiKey);

    return reply.status(201).send({
      message: "API Key erstellt",
      apiKey: {
        ...apiKey,
        rawKey,
      },
    });
  });

  app.post("/:id/keys/:keyId/revoke", async (request, reply) => {
    const { id, keyId } = request.params as { id: string; keyId: string };

    const project = projects.find((p) => p.id === id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const apiKey = project.apiKeys.find((item) => item.id === keyId);

    if (!apiKey) {
      return reply.status(404).send({ error: "API Key nicht gefunden" });
    }

    apiKey.revokedAt = new Date().toISOString();

    return {
      message: "API Key widerrufen",
    };
  });

  app.post("/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = projects.find((p) => p.id === id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const existing = getRunningProcess(project.id);
    if (existing) {
      return reply.status(409).send({
        error: "Projekt läuft bereits",
      });
    }

    const logPath = path.join(runtimePaths.logsRoot, `${project.id}.log`);

    try {
      await ensureDir(runtimePaths.logsRoot);
      await fs.promises.writeFile(
        logPath,
        `\n[START] project=${project.name} (${project.id})\n`,
        { flag: "a" },
      );

      project.status = "building";

      if (project.installCommand.trim()) {
        await runCommand(project.installCommand, project.projectPath, logPath);
      }

      const child = startProjectProcess(
        project.id,
        project.startCommand,
        project.projectPath,
        project.port,
        (projectId, exitCode) => {
          const currentProject = projects.find((p) => p.id === projectId);
          if (!currentProject) return;

          currentProject.pid = undefined;
          currentProject.status = exitCode === 0 ? "stopped" : "failed";
        },
      );

      project.pid = child.pid;
      project.status = "running";

      return {
        message: "Projekt gestartet",
        pid: child.pid,
      };
    } catch (err) {
      project.status = "failed";

      await fs.promises.writeFile(
        logPath,
        `\n[START_FAILED] ${
          err instanceof Error ? err.message : "Unknown error"
        }\n`,
        { flag: "a" },
      );

      return reply.status(500).send({
        error: err instanceof Error ? err.message : "Start fehlgeschlagen",
      });
    }
  });
}