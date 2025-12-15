import { buildApp } from './app';
import { env } from './env';
import { registerRoutes } from './routes';
import { startWorkers, stopWorkers } from './queues';

async function start() {
  console.log('🚀 Starting server...');
  console.log('📦 Building app...');
  const app = await buildApp();
  console.log('✅ App built');

  // Register routes
  console.log('🛣️  Registering routes...');
  await registerRoutes(app);
  console.log('✅ Routes registered');

  // Start workers
  console.log('👷 Starting workers...');
  await startWorkers();
  console.log('✅ Workers started');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await stopWorkers();
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await stopWorkers();
    await app.close();
    process.exit(0);
  });

  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

