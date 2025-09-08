import Fastify from "fastify";
import cors from "@fastify/cors";
import { createServer } from "http";
import { Server } from "socket.io";

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? "*").split(",").map(s => s.trim())
  });

  app.get("/healthz", async () => ({ ok: true }));

  const httpServer = createServer(app as any);
  const io = new Server(httpServer, { path: "/game", cors: { origin: "*" } });
  // TODO: wire namespaces, handlers...

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
