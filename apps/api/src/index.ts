import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

app.get("/health", async () => {
  return { ok: true };
});

app.listen({ port: 4000, host: "0.0.0.0" })
  .then(() => {
    console.log("API läuft auf http://localhost:4000");
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });