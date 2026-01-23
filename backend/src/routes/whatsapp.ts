import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';

const prisma = new PrismaClient();

export async function whatsappRoutes(app: FastifyInstance) {
  // Get WhatsApp groups
  app.get(
    '/groups',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        
        const groups = await prisma.whatsAppGroup.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send({
          success: true,
          data: groups,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Add WhatsApp group
  app.post(
    '/groups',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { name, groupId, consentGiven } = request.body as any;

        if (!consentGiven) {
          return reply.code(400).send({
            success: false,
            message: 'Consent is required to monitor groups',
          });
        }

        const group = await prisma.whatsAppGroup.create({
          data: {
            orgId,
            name,
            groupId,
            scanning: true,
            consentGiven,
            insights: {
              messageCount: 0,
              commonQuestions: [],
              priceQueries: 0,
              productMentions: [],
            },
          },
        });

        return reply.code(201).send({
          success: true,
          data: group,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Update WhatsApp group
  app.put(
    '/groups/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const data = request.body as any;

        const group = await prisma.whatsAppGroup.update({
          where: { id },
          data,
        });

        return reply.send({
          success: true,
          data: group,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Delete WhatsApp group
  app.delete(
    '/groups/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;

        await prisma.whatsAppGroup.delete({
          where: { id },
        });

        return reply.send({
          success: true,
          message: 'Group removed',
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