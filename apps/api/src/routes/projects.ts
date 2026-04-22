import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { ensureDir, extractZip, saveBufferToFile } from "../lib/project-files";
import { runtimePaths } from "../lib/runtime-paths";
import { createProjectId, normalizeSlug } from "../lib/project-utils";
import type { ProjectRecord, ProjectRuntime } from "../types/project";
import { runCommand } from "../runtime/command-runner";
import { requireAuth } from "../plugins/auth";
import {
  getRunningProcess,
  startProjectProcess,
  stopProjectProcess,
} from "../runtime/process-manager";
import {
  getAllProjects,
  getProjectById,
  readProjectConfig,
  readProjectState,
  writeProjectConfig,
  writeProjectState,
} from "../lib/project-config";
import {
  createApiKeyId,
  generateRawApiKey,
  getApiKeyPreview,
  hashApiKey,
} from "../lib/api-keys";

export async function projectRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.get("/", async () => {
    const projectList = await getAllProjects();

    const withState = await Promise.all(
      projectList.map(async (project: ProjectRecord) => {
        const state = await readProjectState(project.id);

        return {
          ...project,
          status: state?.status ?? "stopped",
          pid: state?.pid ?? undefined,
        };
      }),
    );

    return {
      projects: withState,
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

    const existingProjects = await getAllProjects();
    const slugExists = existingProjects.some(
      (project: ProjectRecord) => project.slug === normalizedSlug,
    );

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
      autoStart: true,
    };

    await writeProjectConfig(project);
    await writeProjectState(project.id, {
      status: "stopped",
      pid: null,
      lastStartedAt: null,
      lastStoppedAt: null,
      lastError: null,
    });

    return reply.status(201).send({
      message: "Projekt erstellt",
      project,
    });
  });

  app.post("/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await readProjectConfig(id);

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

      await writeProjectState(project.id, {
        status: "building",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: null,
        lastError: null,
      });

      if (project.installCommand.trim()) {
        await runCommand(project.installCommand, project.projectPath, logPath);
      }

      const child = startProjectProcess(
        project.id,
        project.startCommand,
        project.projectPath,
        project.port,
        async (projectId: string, exitCode: number | null) => {
          const currentState = await readProjectState(projectId);

          await writeProjectState(projectId, {
            status: exitCode === 0 ? "stopped" : "failed",
            pid: null,
            lastStartedAt: currentState?.lastStartedAt ?? null,
            lastStoppedAt: new Date().toISOString(),
            lastError: exitCode === 0 ? null : `Process exited with code ${exitCode}`,
          });
        },
      );

      await writeProjectState(project.id, {
        status: "running",
        pid: child.pid ?? null,
        lastStartedAt: new Date().toISOString(),
        lastStoppedAt: null,
        lastError: null,
      });

      return {
        message: "Projekt gestartet",
        pid: child.pid,
      };
    } catch (err) {
      await writeProjectState(project.id, {
        status: "failed",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: null,
        lastError: err instanceof Error ? err.message : "Unknown error",
      });

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

  app.post("/:id/stop", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await readProjectConfig(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const stopped = stopProjectProcess(project.id);

    if (!stopped) {
      return reply.status(409).send({
        error: "Projekt läuft nicht",
      });
    }

    const currentState = await readProjectState(project.id);

    await writeProjectState(project.id, {
      status: "stopped",
      pid: null,
      lastStartedAt: currentState?.lastStartedAt ?? null,
      lastStoppedAt: new Date().toISOString(),
      lastError: null,
    });

    const logPath = path.join(runtimePaths.logsRoot, `${project.id}.log`);
    await fs.promises.writeFile(logPath, `\n[STOP] project stopped manually\n`, {
      flag: "a",
    });

    return {
      message: "Projekt gestoppt",
    };
  });

  app.post("/:id/restart", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await readProjectConfig(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const running = getRunningProcess(project.id);
    if (running) {
      stopProjectProcess(project.id);

      const currentState = await readProjectState(project.id);

      await writeProjectState(project.id, {
        status: "stopped",
        pid: null,
        lastStartedAt: currentState?.lastStartedAt ?? null,
        lastStoppedAt: new Date().toISOString(),
        lastError: null,
      });
    }

    const logPath = path.join(runtimePaths.logsRoot, `${project.id}.log`);

    try {
      await fs.promises.writeFile(
        logPath,
        `\n[RESTART] project=${project.name} (${project.id})\n`,
        { flag: "a" },
      );

      await writeProjectState(project.id, {
        status: "building",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: null,
        lastError: null,
      });

      if (project.installCommand.trim()) {
        await runCommand(project.installCommand, project.projectPath, logPath);
      }

      const child = startProjectProcess(
        project.id,
        project.startCommand,
        project.projectPath,
        project.port,
        async (projectId: string, exitCode: number | null) => {
          const currentState = await readProjectState(projectId);

          await writeProjectState(projectId, {
            status: exitCode === 0 ? "stopped" : "failed",
            pid: null,
            lastStartedAt: currentState?.lastStartedAt ?? null,
            lastStoppedAt: new Date().toISOString(),
            lastError: exitCode === 0 ? null : `Process exited with code ${exitCode}`,
          });
        },
      );

      await writeProjectState(project.id, {
        status: "running",
        pid: child.pid ?? null,
        lastStartedAt: new Date().toISOString(),
        lastStoppedAt: null,
        lastError: null,
      });

      return {
        message: "Projekt neugestartet",
        pid: child.pid,
      };
    } catch (err) {
      await writeProjectState(project.id, {
        status: "failed",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: null,
        lastError: err instanceof Error ? err.message : "Unknown error",
      });

      await fs.promises.writeFile(
        logPath,
        `\n[RESTART_FAILED] ${
          err instanceof Error ? err.message : "Unknown error"
        }\n`,
        { flag: "a" },
      );

      return reply.status(500).send({
        error: err instanceof Error ? err.message : "Restart fehlgeschlagen",
      });
    }
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

    const project = await readProjectConfig(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    return {
      keys: Array.isArray(project.apiKeys) ? project.apiKeys : [],
    };
  });

  app.post("/:id/keys", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { name?: string };

    const project = await readProjectConfig(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    if (!Array.isArray(project.apiKeys)) {
      project.apiKeys = [];
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
    await writeProjectConfig(project);

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

    const project = await readProjectConfig(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    const apiKey = (project.apiKeys ?? []).find((item) => item.id === keyId);

    if (!apiKey) {
      return reply.status(404).send({ error: "API Key nicht gefunden" });
    }

    apiKey.revokedAt = new Date().toISOString();
    await writeProjectConfig(project);

    return {
      message: "API Key widerrufen",
    };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await getProjectById(id);

    if (!project) {
      return reply.status(404).send({ error: "Projekt nicht gefunden" });
    }

    return {
      project,
    };
  });
}