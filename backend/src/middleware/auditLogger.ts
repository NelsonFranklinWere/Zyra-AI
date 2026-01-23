import { FastifyRequest, FastifyReply } from 'fastify';
import { createAuditLog } from '../services/auditLog';

export function auditLogger(action: string, resource?: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Store audit info in request for later logging
    (request as any).auditInfo = {
      action,
      resource,
      method: request.method,
      url: request.url,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] || undefined,
    };
    
    // The actual logging will happen in the route handler or via a different hook
  };
}

