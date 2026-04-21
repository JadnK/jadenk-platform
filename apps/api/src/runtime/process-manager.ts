import { spawn, type ChildProcess } from "node:child_process";

const runningProcesses = new Map<string, ChildProcess>();

export function startProjectProcess(
  projectId: string,
  command: string,
  cwd: string,
  port: number,
) {
  const child = spawn(command, {
    cwd,
    shell: true,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: "pipe",
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
  return runningProcesses.get(projectId);
}