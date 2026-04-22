import fs from "node:fs";
import path from "node:path";
import { getAllProjects, readProjectState, writeProjectState } from "../lib/project-config";
import { ensureDir } from "../lib/project-files";
import { runtimePaths } from "../lib/runtime-paths";
import { runCommand } from "./command-runner";
import { startProjectProcess } from "./process-manager";

export async function bootstrapProjects() {
  await ensureDir(runtimePaths.projectsRoot);
  await ensureDir(runtimePaths.logsRoot);

  const projects = await getAllProjects();

  for (const project of projects) {
    const logPath = path.join(runtimePaths.logsRoot, `${project.id}.log`);

    const previousState = await readProjectState(project.id);

    await writeProjectState(project.id, {
      status: "stopped",
      pid: null,
      lastStartedAt: previousState?.lastStartedAt ?? null,
      lastStoppedAt: previousState?.lastStoppedAt ?? null,
      lastError: null,
    });

    if (!project.autoStart) {
      await fs.promises.writeFile(
        logPath,
        `\n[BOOT] skipped auto start for ${project.slug}\n`,
        { flag: "a" },
      );
      continue;
    }

    try {
      await fs.promises.writeFile(
        logPath,
        `\n[BOOT] auto starting ${project.slug}\n`,
        { flag: "a" },
      );

      await writeProjectState(project.id, {
        status: "building",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: previousState?.lastStoppedAt ?? null,
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
        async (projectId, exitCode) => {
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
    } catch (error) {
      await fs.promises.writeFile(
        logPath,
        `\n[BOOT_FAILED] ${error instanceof Error ? error.message : "Unknown error"}\n`,
        { flag: "a" },
      );

      await writeProjectState(project.id, {
        status: "failed",
        pid: null,
        lastStartedAt: null,
        lastStoppedAt: previousState?.lastStoppedAt ?? null,
        lastError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}