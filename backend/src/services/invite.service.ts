import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { env } from '../env';

const prisma = new PrismaClient();

export interface InviteUserInput {
  email: string;
  name: string;
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  invitedBy: string;
  permissions?: Record<string, boolean>;
}

/**
 * Create an invitation for a new team member
 */
export async function createInvite(input: InviteUserInput): Promise<{ inviteToken: string; inviteUrl: string }> {
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteExpiresAt = new Date();
  inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days to accept

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser && existingUser.orgId === input.orgId) {
    throw new Error('User already exists in this organization');
  }

  // Create or update user with invite token
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      inviteToken,
      inviteExpiresAt,
      invitedAt: new Date(),
      invitedBy: input.invitedBy,
      orgId: input.orgId,
      role: input.role,
      permissions: input.permissions || null,
    },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      orgId: input.orgId,
      inviteToken,
      inviteExpiresAt,
      invitedAt: new Date(),
      invitedBy: input.invitedBy,
      permissions: input.permissions || null,
      // No passwordHash - user must set it when accepting invite
    },
  });

  const inviteUrl = `${env.BASE_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;

  await prisma.auditLog.create({
    data: {
      orgId: input.orgId,
      userId: input.invitedBy,
      action: 'USER_INVITED',
      resource: 'User',
      resourceId: user.id,
      metadata: {
        invitedEmail: input.email,
        role: input.role,
      },
    },
  });

  return { inviteToken, inviteUrl };
}

/**
 * Accept an invitation and set password
 */
export async function acceptInvite(
  inviteToken: string,
  password: string
): Promise<{ user: any; success: boolean }> {
  const user = await prisma.user.findUnique({
    where: { inviteToken },
  });

  if (!user) {
    throw new Error('Invalid invite token');
  }

  if (!user.inviteExpiresAt || user.inviteExpiresAt < new Date()) {
    throw new Error('Invite token has expired');
  }

  if (user.passwordHash) {
    throw new Error('Invite already accepted');
  }

  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      inviteToken: null,
      inviteExpiresAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      orgId: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId: user.orgId || undefined,
      userId: user.id,
      action: 'INVITE_ACCEPTED',
      resource: 'User',
      resourceId: user.id,
    },
  });

  return { user: updatedUser, success: true };
}

/**
 * Resend invitation (generates new token)
 */
export async function resendInvite(email: string, invitedBy: string): Promise<{ inviteToken: string; inviteUrl: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.inviteToken) {
    throw new Error('No pending invitation found for this email');
  }

  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteExpiresAt = new Date();
  inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      inviteToken,
      inviteExpiresAt,
      invitedBy,
      invitedAt: new Date(),
    },
  });

  const inviteUrl = `${env.BASE_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;

  return { inviteToken, inviteUrl };
}

/**
 * Cancel/revoke an invitation
 */
export async function cancelInvite(email: string, cancelledBy: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.inviteToken) {
    throw new Error('No pending invitation found for this email');
  }

  // If user has no password, delete the user record (invite not accepted)
  if (!user.passwordHash) {
    await prisma.user.delete({
      where: { id: user.id },
    });
  } else {
    // If user has password, just clear invite fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        inviteToken: null,
        inviteExpiresAt: null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      orgId: user.orgId || undefined,
      userId: cancelledBy,
      action: 'INVITE_CANCELLED',
      resource: 'User',
      resourceId: user.id,
      metadata: { cancelledEmail: email },
    },
  });
}

