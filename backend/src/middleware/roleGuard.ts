import { FastifyRequest, FastifyReply } from 'fastify';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    if (!user.role || !allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        success: false,
        message: 'Insufficient permissions',
      });
    }
  };
}

export async function requireOrgAccess(request: FastifyRequest, reply: FastifyReply) {
  console.log('🔍 requireOrgAccess: Starting');
  
  const user = request.user as any;
  console.log('🔍 requireOrgAccess: User orgId:', user?.orgId);
  
  if (!user?.orgId) {
    console.log('❌ requireOrgAccess: No orgId found');
    return reply.code(400).send({
      success: false,
      message: 'Organization ID required',
    });
  }
  
  // Attach orgId to request
  (request as any).orgId = user.orgId;
  console.log('✅ requireOrgAccess: Success, orgId attached:', user.orgId);
}

