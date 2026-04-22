import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runtimePaths } from "../lib/runtime-paths";

type OnProjectExit = (projectId: string, exitCode: number | null) => void;

const runningProcesses = new Map<string, ChildProcess>();

export function startProjectProcess(
  projectId: string,
  command: string,
  cwd: string,
  port: number,
  onExit?: OnProjectExit,
) {
  const logPath = path.join(runtimePaths.logsRoot, `${projectId}.log`);
  const logStream = fs.createWriteStream(logPath, { flags: "a" });

  logStream.write(`\n[INFO] Starting project on PORT=${port}\n`);

  const child = spawn(command, {
    cwd,
    shell: true,
    env: {
      ...process.env,
      PORT: String(port)
    },
  });

  child.stdout?.on("data", (data) => {
    logStream.write(`[OUT] ${data}`);
  });

  child.stderr?.on("data", (data) => {
    logStream.write(`[ERR] ${data}`);
  });

  child.on("error", (error) => {
    logStream.write(`[PROCESS_ERROR] ${String(error)}\n`);
  });

  child.on("close", (code) => {
    logStream.write(`\n[EXIT] code=${code}\n`);
    runningProcesses.delete(projectId);
    onExit?.(projectId, code);
  });

  runningProcesses.set(projectId, child);

  return child;
}

export function stopProjectProcess(projectId: string) {
  const child = runningProcesses.get(projectId);

  if (!child) {
    return false;
  }

  child.kill();
  runningProcesses.delete(projectId);
  return true;
}

export function getRunningProcess(projectId: string) {
  return runningProcesses.get(projectId) || null;
}