import { FastifyRequest, FastifyReply } from 'fastify';
import { checkOrgRateLimit, checkPhoneRateLimit } from '../utils/rateLimiter';
import { checkOptOut } from '../utils/optOut';

export interface RateLimitConfig {
  windowMs: number;
  limit: number;
}

const DEFAULT_LIMITS = {
  message: { windowMs: 60 * 1000, limit: 10 }, // 10 per minute
  daily: { windowMs: 24 * 60 * 60 * 1000, limit: 1000 }, // 1000 per day
};

export function orgRateLimiter(type: 'message' | 'llm' | 'stk' = 'message') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).orgId || user?.orgId;

      if (!orgId) {
        return; // Skip if no org context
      }

      const config = DEFAULT_LIMITS[type === 'message' ? 'message' : 'daily'];
      const result = await checkOrgRateLimit(orgId, type, config);

      if (!result.allowed) {
        reply.header('X-RateLimit-Limit', config.limit.toString());
        reply.header('X-RateLimit-Remaining', '0');
        reply.header('X-RateLimit-Reset', result.resetAt.toISOString());

        return reply.code(429).send({
          success: false,
          message: `Rate limit exceeded for ${type}. Try again after ${result.resetAt.toISOString()}`,
        });
      }

      reply.header('X-RateLimit-Limit', config.limit.toString());
      reply.header('X-RateLimit-Remaining', result.remaining.toString());
      reply.header('X-RateLimit-Reset', result.resetAt.toISOString());
    } catch (error) {
      // Don't fail on rate limit errors
      console.error('Rate limit check error:', error);
    }
  };
}

export function phoneRateLimiter() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const phoneNumber = body.from || body.phone || body.phoneNumber;

      if (!phoneNumber) {
        return; // Skip if no phone number
      }

      // Check opt-out first
      const orgId = (request as any).orgId;
      if (orgId) {
        const isOptedOut = await checkOptOut(orgId, phoneNumber);
        if (isOptedOut) {
          return reply.code(403).send({
            success: false,
            message: 'User has opted out',
          });
        }
      }

      const config = DEFAULT_LIMITS.message;
      const result = await checkPhoneRateLimit(phoneNumber, config);

      if (!result.allowed) {
        reply.header('X-RateLimit-Limit', config.limit.toString());
        reply.header('X-RateLimit-Remaining', '0');
        reply.header('X-RateLimit-Reset', result.resetAt.toISOString());

        return reply.code(429).send({
          success: false,
          message: 'Rate limit exceeded for phone number',
        });
      }

      reply.header('X-RateLimit-Limit', config.limit.toString());
      reply.header('X-RateLimit-Remaining', result.remaining.toString());
      reply.header('X-RateLimit-Reset', result.resetAt.toISOString());
    } catch (error) {
      console.error('Phone rate limit check error:', error);
    }
  };
}

