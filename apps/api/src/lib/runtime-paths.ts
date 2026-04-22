import path from "node:path";

export const runtimePaths = {
  runtimeRoot: path.resolve(process.cwd(), "../../runtime"),
  projectsRoot: path.resolve(process.cwd(), "../../runtime/projects"),
  uploadsRoot: path.resolve(process.cwd(), "../../runtime/uploads"),
  logsRoot: path.resolve(process.cwd(), "../../runtime/logs"),
};