import { FastifyRequest, FastifyReply } from 'fastify';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as any;

      if (!user.role || !allowedRoles.includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'Insufficient permissions',
        });
      }
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: 'Unauthorized',
      });
    }
  };
}

export function requireOrgAccess() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as any;
      const orgId = (request.params as any)?.orgId || (request.body as any)?.orgId;

      if (!user.orgId && !orgId) {
        return reply.code(400).send({
          success: false,
          message: 'Organization ID required',
        });
      }

      // Attach orgId to request for later use
      (request as any).orgId = orgId || user.orgId;
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: 'Unauthorized',
      });
    }
  };
}

