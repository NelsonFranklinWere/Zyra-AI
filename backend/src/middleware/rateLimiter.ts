import { FastifyRequest, FastifyReply } from 'fastify';
import { getRedis } from '../config/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator?: (request: FastifyRequest) => string;
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const redis = getRedis();
      if (!redis) {
        // If Redis not available, allow request (fail open)
        return;
      }

      const key = options.keyGenerator
        ? options.keyGenerator(request)
        : `rate_limit:${request.ip}:${request.routerPath}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, options.windowMs);
      }

      const ttl = await redis.pttl(key);
      const remaining = Math.max(0, options.max - current);

      reply.header('X-RateLimit-Limit', options.max.toString());
      reply.header('X-RateLimit-Remaining', remaining.toString());
      reply.header('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());

      if (current > options.max) {
        return reply.code(429).send({
          success: false,
          message: 'Too many requests, please try again later',
        });
      }
    } catch (error) {
      // If Redis fails, allow request (fail open)
      console.error('Rate limiter error:', error);
    }
  };
}

