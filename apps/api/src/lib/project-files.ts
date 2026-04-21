import fs from "node:fs";
import path from "node:path";
import unzipper from "unzipper";

export async function ensureDir(dirPath: string) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

export async function saveBufferToFile(filePath: string, buffer: Buffer) {
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, buffer);
}

export async function extractZip(zipPath: string, outputPath: string) {
  await ensureDir(outputPath);

  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: outputPath }))
    .promise();
}