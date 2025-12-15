import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getSystemMetrics, getPrometheusMetrics } from '../services/metrics.service';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../config/redis';

const prisma = new PrismaClient();

export async function healthRoutes(app: FastifyInstance) {
  // Health check endpoint
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis
      const redis = getRedis();
      let redisHealthy = false;
      if (redis) {
        try {
          await redis.ping();
          redisHealthy = true;
        } catch {
          redisHealthy = false;
        }
      }

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          redis: redis ? (redisHealthy ? 'healthy' : 'unhealthy') : 'not_configured',
        },
      };

      const allHealthy = health.services.database === 'healthy' && 
                        (health.services.redis === 'healthy' || health.services.redis === 'not_configured');

      return reply
        .code(allHealthy ? 200 : 503)
        .send(health);
    } catch (error: any) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  // Metrics endpoint (Prometheus format)
  app.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = await getPrometheusMetrics();
      return reply
        .type('text/plain')
        .send(metrics);
    } catch (error: any) {
      return reply.code(500).send({
        error: 'Failed to generate metrics',
        message: error.message,
      });
    }
  });

  // System metrics (JSON)
  app.get(
    '/system/metrics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await getSystemMetrics();
        return reply.send({
          success: true,
          data: metrics,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );
}

