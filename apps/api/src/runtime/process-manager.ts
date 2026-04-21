import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runtimePaths } from "../lib/runtime-paths";

const runningProcesses = new Map<string, ChildProcess>();

export function startProjectProcess(
  projectId: string,
  command: string,
  cwd: string,
  port: number,
) {
  const logPath = path.join(runtimePaths.logsRoot, `${projectId}.log`);
  const logStream = fs.createWriteStream(logPath, { flags: "a" });

  const child = spawn(command, {
    cwd,
    shell: true,
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  child.stdout?.on("data", (data) => {
    logStream.write(`[OUT] ${data}`);
  });

  child.stderr?.on("data", (data) => {
    logStream.write(`[ERR] ${data}`);
  });

  child.on("close", (code) => {
    logStream.write(`\n[EXIT] code=${code}\n`);
  });

  runningProcesses.set(projectId, child);

  return child;
}

export function stopProjectProcess(projectId: string) {
  const child = runningProcesses.get(projectId);

  if (!child) return false;

  child.kill();
  runningProcesses.delete(projectId);
  return true;
}