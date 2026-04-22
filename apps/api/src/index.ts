import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import { projectRoutes } from "./routes/projects";
import { proxyRoutes } from "./routes/proxy";
import { bootstrapProjects } from "./runtime/bootstrap-projects";
import { authRoutes } from "./routes/auth";
import { ensureAuthConfig, getInitialCredentials } from "./lib/auth-config";

async function main() {
  await ensureAuthConfig();

  const app = Fastify({
    logger: true,
  });

  await app.register(cookie);

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 100,
    },
  });

  app.get("/health", async () => {
    return {
      ok: true,
      service: "api",
    };
  });

  app.get("/api/hello", async () => {
    return {
      message: "Hallo von der API 👋",
    };
  });

  app.get("/auth/bootstrap", async () => {
    const creds = getInitialCredentials();

    return {
      username: creds.username,
      initialPassword: creds.password,
      note: "Nur für Setup/Development gedacht.",
    };
  });

  await app.register(authRoutes, {
    prefix: "/auth",
  });

  await app.register(projectRoutes, {
    prefix: "/projects",
  });

  await app.register(proxyRoutes);

  await bootstrapProjects();

  await app.listen({
    host: "0.0.0.0",
    port: 4000,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});