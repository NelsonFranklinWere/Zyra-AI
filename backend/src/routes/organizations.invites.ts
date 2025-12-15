import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess, requireRole } from '../middleware/roleGuard';
import { requirePermission } from '../middleware/permissions';
import { createInvite, resendInvite, cancelInvite } from '../services/invite.service';

export async function inviteRoutes(app: FastifyInstance) {
  // Create invite (requires canManageUsers permission)
  app.post(
    '/invites',
    {
      preHandler: [authGuard, requireOrgAccess, requirePermission('canManageUsers')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const user = (request as any).user;
        const { email, name, role, permissions } = request.body as any;

        const result = await createInvite({
          email,
          name,
          orgId,
          role: role || 'STAFF',
          invitedBy: user.userId,
          permissions,
        });

        return reply.code(201).send({
          success: true,
          data: {
            inviteUrl: result.inviteUrl,
            inviteToken: result.inviteToken, // Include for testing/admin use
          },
        });
      } catch (error: any) {
        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to create invite',
        });
      }
    }
  );

  // Resend invite
  app.post(
    '/invites/resend',
    {
      preHandler: [authGuard, requireOrgAccess, requirePermission('canManageUsers')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { email } = request.body as any;

        const result = await resendInvite(email, user.userId);

        return reply.send({
          success: true,
          data: {
            inviteUrl: result.inviteUrl,
            inviteToken: result.inviteToken,
          },
        });
      } catch (error: any) {
        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to resend invite',
        });
      }
    }
  );

  // Cancel invite
  app.post(
    '/invites/cancel',
    {
      preHandler: [authGuard, requireOrgAccess, requirePermission('canManageUsers')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { email } = request.body as any;

        await cancelInvite(email, user.userId);

        return reply.send({
          success: true,
          message: 'Invite cancelled',
        });
      } catch (error: any) {
        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to cancel invite',
        });
      }
    }
  );
}

