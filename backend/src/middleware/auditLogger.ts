import { FastifyRequest, FastifyReply } from 'fastify';
import { createAuditLog } from '../services/auditLog';

export function auditLogger(action: string, resource?: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Log after response is sent
    reply.addHook('onSend', async (request, reply, payload) => {
      const user = (request as any).user;
      const orgId = (request as any).orgId;

      // Extract resource ID from params or body if available
      const resourceId =
        (request.params as any)?.id || (request.body as any)?.id || null;

      await createAuditLog({
        userId: user?.userId,
        orgId: orgId,
        action,
        resource,
        resourceId,
        metadata: {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || undefined,
      });
    });
  };
}

