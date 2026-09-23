import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initSocketServer } from './sockets/socket.server';

// Initialize Database & Start Server
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 WFA Backend API server is running on http://localhost:${env.PORT}`);
    console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`📖 Swagger API docs available at: http://localhost:${env.PORT}/api-docs`);
  });

  // Attach Socket.IO server
  initSocketServer(server);

  // Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

    // Disconnect MongoDB cleanly
    await disconnectDatabase();

    server.close(() => {
      console.log('✅ HTTP server closed. Process exiting cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('❌ Forcefully shutting down due to timeout.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('❌ Fatal error during server startup:', err);
  process.exit(1);
});
