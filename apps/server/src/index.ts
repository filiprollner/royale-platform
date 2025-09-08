import { createServer } from "http";

async function main() {
  try {
    console.log('Starting minimal server...');
    
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? "0.0.0.0";
    
    console.log(`Creating HTTP server on ${host}:${port}`);
    
    const server = createServer((req, res) => {
      console.log(`Request: ${req.method} ${req.url}`);
      
      if (req.url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello from Royale Platform Server!');
    });

    server.listen(port, host, () => {
      console.log(`✅ Server listening on ${host}:${port}`);
      console.log('✅ Health check available at /healthz');
    });

    server.on('error', (err) => {
      console.error('❌ HTTP Server error:', err);
      process.exit(1);
    });

    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
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