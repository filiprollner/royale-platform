import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: (process.env.CORS_ORIGINS ?? '*').split(',').map(s => s.trim())
});
app.get('/healthz', async () => ({ ok: true }));

// ...rest of your Socket.IO bootstrap
