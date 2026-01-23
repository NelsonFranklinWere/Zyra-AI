import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';

const prisma = new PrismaClient();

export async function socialRoutes(app: FastifyInstance) {
  // Get social accounts
  app.get(
    '/accounts',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        
        const accounts = await prisma.socialAccount.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send({
          success: true,
          data: accounts,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Add social account
  app.post(
    '/accounts',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { platform, username, leadCapture, autoReply } = request.body as any;

        const account = await prisma.socialAccount.create({
          data: {
            orgId,
            platform,
            username,
            connected: true,
            leadCapture: leadCapture || false,
            autoReply: autoReply || false,
          },
        });

        return reply.code(201).send({
          success: true,
          data: account,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Update social account
  app.put(
    '/accounts/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const data = request.body as any;

        const account = await prisma.socialAccount.update({
          where: { id },
          data,
        });

        return reply.send({
          success: true,
          data: account,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Delete social account
  app.delete(
    '/accounts/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;

        await prisma.socialAccount.delete({
          where: { id },
        });

        return reply.send({
          success: true,
          message: 'Account removed',
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Get social leads
  app.get(
    '/leads',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        
        const leads = await prisma.socialLead.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        return reply.send({
          success: true,
          data: leads,
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