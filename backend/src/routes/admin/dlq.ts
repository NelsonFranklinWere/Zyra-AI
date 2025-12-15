import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../../middleware/authGuard';
import { requireRole } from '../../middleware/roleGuard';
import { PrismaClient } from '@prisma/client';
import { messageQueue } from '../../queues';

const prisma = new PrismaClient();

export async function dlqRoutes(app: FastifyInstance) {
  // List DLQ items
  app.get(
    '/admin/dlq',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { status, limit = 50 } = request.query as any;

        const items = await prisma.deadLetterJob.findMany({
          where: status ? { status } : undefined,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
        });

        return reply.send({
          success: true,
          data: items,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Reprocess DLQ item
  app.post(
    '/admin/dlq/:id/reprocess',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;

        const dlqItem = await prisma.deadLetterJob.findUnique({
          where: { id },
        });

        if (!dlqItem) {
          return reply.code(404).send({
            success: false,
            message: 'DLQ item not found',
          });
        }

        if (dlqItem.status === 'reprocessing') {
          return reply.code(400).send({
            success: false,
            message: 'Item is already being reprocessed',
          });
        }

        // Mark as reprocessing
        await prisma.deadLetterJob.update({
          where: { id },
          data: {
            status: 'reprocessing',
          },
        });

        // Re-enqueue job
        await messageQueue.add('process-message', dlqItem.payload, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        });

        // Mark as reprocessed
        await prisma.deadLetterJob.update({
          where: { id },
          data: {
            status: 'reprocessed',
            reprocessedAt: new Date(),
          },
        });

        return reply.send({
          success: true,
          message: 'DLQ item reprocessed',
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Discard DLQ item
  app.delete(
    '/admin/dlq/:id',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const { reason } = (request.body as any) || {};

        await prisma.deadLetterJob.update({
          where: { id },
          data: {
            status: 'discarded',
            metadata: { reason, discardedAt: new Date() },
          },
        });

        return reply.send({
          success: true,
          message: 'DLQ item discarded',
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

