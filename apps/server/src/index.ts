import Fastify from "fastify";
import cors from "@fastify/cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameNamespace } from "./socket/GameNamespace";

async function main() {
  try {
    console.log('Starting server...');
    
    const app = Fastify({ logger: true });
    await app.register(cors, {
      origin: (process.env.CORS_ORIGINS ?? "*").split(",").map(s => s.trim())
    });

    app.get("/healthz", async () => ({ ok: true }));

    const httpServer = createServer(app as any);
    const io = new Server(httpServer, { 
      path: "/game", 
      cors: { origin: "*" }
    });

    // Initialize game namespace
    console.log('Initializing game namespace...');
    try {
      new GameNamespace(io);
      console.log('GameNamespace created successfully');
    } catch (error) {
      console.error('Failed to create GameNamespace:', error);
      throw error;
    }

    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? "0.0.0.0";
    
    console.log(`Starting server on ${host}:${port}`);
    httpServer.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`);
      console.log('Socket.IO server initialized');
    });

    // Handle server errors
    httpServer.on('error', (err) => {
      console.error('HTTP Server error:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});