import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createRuleSchema } from '@zyra/shared';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess, requireRole } from '../middleware/roleGuard';
import { rateLimit } from '../middleware/rateLimiter';

const prisma = new PrismaClient();

export async function rulesRoutes(app: FastifyInstance) {
  // Create/update rule
  app.post(
    '/',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        requireRole('OWNER', 'ADMIN'),
        rateLimit({ windowMs: 60 * 1000, max: 20 }),
      ],
    },
    async (request: FastifyRequest<{ Body: { key: string; value: any } }>, reply: FastifyReply) => {
      try {
        const body = createRuleSchema.parse(request.body);
        const orgId = (request as any).orgId;

        const rule = await prisma.conversationRule.upsert({
          where: {
            orgId_key: {
              orgId,
              key: body.key,
            },
          },
          update: {
            value: body.value,
          },
          create: {
            orgId,
            key: body.key,
            value: body.value,
          },
        });

        return reply.code(201).send({
          success: true,
          data: rule,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to create rule',
        });
      }
    }
  );

  // Get rules
  app.get(
    '/',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;

        const rules = await prisma.conversationRule.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send({
          success: true,
          data: rules,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch rules',
        });
      }
    }
  );

  // Delete rule
  app.delete(
    '/:key',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        requireRole('OWNER', 'ADMIN'),
      ],
    },
    async (request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
      try {
        const { key } = request.params;
        const orgId = (request as any).orgId;

        await prisma.conversationRule.deleteMany({
          where: { orgId, key },
        });

        return reply.send({
          success: true,
          message: 'Rule deleted successfully',
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to delete rule',
        });
      }
    }
  );
}

