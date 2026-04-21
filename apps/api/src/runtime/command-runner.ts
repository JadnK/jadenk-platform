import { spawn } from "node:child_process";
import fs from "node:fs";

export function runCommand(
  command: string,
  cwd: string,
  logPath: string,
  extraEnv?: Record<string, string>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const logStream = fs.createWriteStream(logPath, { flags: "a" });

    logStream.write(`\n[CMD] ${command}\n`);

    const child = spawn(command, {
      cwd,
      shell: true,
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    let stderr = "";
    let stdout = "";

    child.stdout?.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      logStream.write(`[OUT] ${text}`);
    });

    child.stderr?.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      logStream.write(`[ERR] ${text}`);
    });

    child.on("error", (error) => {
      logStream.write(`[ERROR] ${String(error)}\n`);
      reject(error);
    });

    child.on("close", (code) => {
      logStream.write(`\n[CMD_EXIT] code=${code}\n`);

      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed (${code})\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
        ),
      );
    });
  });
}