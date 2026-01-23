import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';

const prisma = new PrismaClient();

export async function businessRoutes(app: FastifyInstance) {
  // Get business profile
  app.get(
    '/profile',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        
        const profile = await prisma.businessProfile.findUnique({
          where: { orgId },
        });

        return reply.send({
          success: true,
          data: profile || {},
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Update business profile
  app.put(
    '/profile',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const data = request.body as any;

        const profile = await prisma.businessProfile.upsert({
          where: { orgId },
          update: {
            description: data.description,
            tone: data.tone,
            workingHours: data.workingHours,
            deliveryZones: data.deliveryZones,
            policies: data.policies,
          },
          create: {
            orgId,
            description: data.description,
            tone: data.tone,
            workingHours: data.workingHours,
            deliveryZones: data.deliveryZones,
            policies: data.policies,
          },
        });

        return reply.send({
          success: true,
          data: profile,
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