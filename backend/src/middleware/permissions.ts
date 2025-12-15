import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Permission {
  canSendMessages?: boolean;
  canApproveTemplates?: boolean;
  canManageRules?: boolean;
  canViewAnalytics?: boolean;
  canManageOrders?: boolean;
  canManageUsers?: boolean;
  canManageSettings?: boolean;
  canProcessPayments?: boolean;
}

/**
 * Default permissions based on role
 */
const defaultPermissions: Record<string, Permission> = {
  OWNER: {
    canSendMessages: true,
    canApproveTemplates: true,
    canManageRules: true,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageUsers: true,
    canManageSettings: true,
    canProcessPayments: true,
  },
  ADMIN: {
    canSendMessages: true,
    canApproveTemplates: true,
    canManageRules: true,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageUsers: false,
    canManageSettings: false,
    canProcessPayments: true,
  },
  STAFF: {
    canSendMessages: true,
    canApproveTemplates: false,
    canManageRules: false,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageUsers: false,
    canManageSettings: false,
    canProcessPayments: false,
  },
};

/**
 * Get effective permissions for a user (role defaults + custom overrides)
 */
export async function getUserPermissions(userId: string, orgId?: string): Promise<Permission> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      permissions: true,
      orgId: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Must be in same org if orgId provided
  if (orgId && user.orgId !== orgId) {
    throw new Error('User not in organization');
  }

  const rolePermissions = defaultPermissions[user.role] || {};
  const customPermissions = (user.permissions as Permission) || {};

  // Merge: custom permissions override role defaults
  return {
    ...rolePermissions,
    ...customPermissions,
  };
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: keyof Permission,
  orgId?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, orgId);
  return permissions[permission] === true;
}

/**
 * Middleware factory: require a specific permission
 */
export function requirePermission(permission: keyof Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required',
        });
      }

      const orgId = (request as any).orgId || user.orgId;
      const hasAccess = await hasPermission(user.userId, permission, orgId);

      if (!hasAccess) {
        return reply.code(403).send({
          success: false,
          message: `Permission denied: ${permission} required`,
        });
      }
    } catch (error: any) {
      return reply.code(403).send({
        success: false,
        message: error.message || 'Permission check failed',
      });
    }
  };
}

/**
 * Middleware: require multiple permissions (OR logic - any one is enough)
 */
export function requireAnyPermission(...permissions: Array<keyof Permission>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required',
        });
      }

      const orgId = (request as any).orgId || user.orgId;
      
      for (const permission of permissions) {
        if (await hasPermission(user.userId, permission, orgId)) {
          return; // Has at least one permission
        }
      }

      return reply.code(403).send({
        success: false,
        message: `Permission denied: one of [${permissions.join(', ')}] required`,
      });
    } catch (error: any) {
      return reply.code(403).send({
        success: false,
        message: error.message || 'Permission check failed',
      });
    }
  };
}

