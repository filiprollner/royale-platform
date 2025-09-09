import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { GameNamespace } from './socket/GameNamespace';

async function main() {
  try {
    console.log('🚀 Starting Royale Platform Server...');
    
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? "0.0.0.0";
    
    // Create Fastify app
    const app = Fastify({ 
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty'
        }
      }
    });

    // Register CORS
    await app.register(cors, {
      origin: (process.env.CORS_ORIGINS ?? '*').split(',').map(s => s.trim())
    });

    // Health check route
    app.get('/healthz', async () => ({ ok: true }));

    // Create HTTP server
    const httpServer = createServer(app as any);
    
    // Create Socket.IO server
    const io = new SocketIOServer(httpServer, {
      path: '/game',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize game namespace
    new GameNamespace(io);

    // Start server
    httpServer.listen(port, host, () => {
      console.log(`✅ Server listening on ${host}:${port}`);
      console.log('✅ Health check available at /healthz');
      console.log('✅ Socket.IO available at /game');
    });

    httpServer.on('error', (err) => {
      console.error('❌ HTTP Server error:', err);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});