import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
  credentials: true,
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