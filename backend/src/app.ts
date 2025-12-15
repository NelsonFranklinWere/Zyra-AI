import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { env } from './env';
import { connectRedis } from './config/redis';
import { initializeQueues } from './config/queues';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Security
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Cookie support
  await app.register(cookie, {
    secret: env.JWT_SECRET,
    hook: 'onRequest',
  });

  // JWT
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // Health check will be registered via healthRoutes

  // Initialize Redis and queues
  try {
    if (env.REDIS_URL) {
      await connectRedis();
      await initializeQueues();
    }
  } catch (error) {
    app.log.warn('Redis not available, continuing without queues');
  }

  return app;
}

