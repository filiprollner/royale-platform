import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { GameNamespace } from './socket/GameNamespace';

const fastify = Fastify({
  logger: true
});

// Start server
const start = async () => {
  try {
    // CORS configuration
    await fastify.register(cors, {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    });

    // Health check endpoint
    fastify.get('/healthz', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);

    // Initialize Socket.IO
    const io = new SocketIOServer(fastify.server, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket']
    });

    // Initialize game namespace
    new GameNamespace(io);

    console.log('Socket.IO server initialized');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
