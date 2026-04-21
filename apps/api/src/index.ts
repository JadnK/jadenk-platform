import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { projectRoutes } from "./routes/projects";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(multipart);

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

await app.register(projectRoutes, {
  prefix: "/projects",
});

const start = async () => {
  try {
    await app.listen({
      host: "0.0.0.0",
      port: 4000,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();