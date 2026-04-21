import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runtimePaths = {
  runtimeRoot: path.resolve(__dirname, "../../../../runtime"),
  projectsRoot: path.resolve(__dirname, "../../../../runtime/projects"),
  uploadsRoot: path.resolve(__dirname, "../../../../runtime/uploads"),
  logsRoot: path.resolve(__dirname, "../../../../runtime/logs"),
};