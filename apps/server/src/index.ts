import Fastify from "fastify";
import cors from "@fastify/cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameNamespace } from "./socket/GameNamespace";

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? "*").split(",").map(s => s.trim())
  });

  app.get("/healthz", async () => ({ ok: true }));

  const httpServer = createServer(app as any);
  const io = new Server(httpServer, { 
    path: "/game", 
    cors: { origin: "*" },
    transports: ['websocket']
  });

  // Initialize game namespace
  new GameNamespace(io);

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "0.0.0.0";
  
  await app.listen({ port, host });
  console.log(`Server listening on ${host}:${port}`);
  console.log('Socket.IO server initialized');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});