import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Create a new refresh token with rotation support
 */
export async function createRefreshToken(
  userId: string,
  familyId?: string,
  previousToken?: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  // Generate family ID if not provided (first token in family)
  const tokenFamilyId = familyId || crypto.randomBytes(16).toString('hex');

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      familyId: tokenFamilyId,
      previousToken: previousToken || null,
      expiresAt,
      revoked: false,
    },
  });

  return token;
}

/**
 * Verify refresh token and handle rotation
 * Returns userId and token family ID if valid
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string; familyId: string } | null> {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!refreshToken) {
    return null;
  }

  // Check if revoked or expired
  if (refreshToken.revoked || refreshToken.expiresAt < new Date()) {
    return null;
  }

  return {
    userId: refreshToken.userId,
    familyId: refreshToken.familyId || '',
  };
}

/**
 * Rotate refresh token (invalidates old, creates new)
 */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ newToken: string; familyId: string; userId: string } | null> {
  const tokenData = await verifyRefreshToken(oldToken);
  if (!tokenData) {
    return null;
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { token: oldToken },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: 'Token rotated',
    },
  });

  // Revoke all other tokens in the same family (security: prevent reuse attacks)
  await prisma.refreshToken.updateMany({
    where: {
      familyId: tokenData.familyId,
      token: { not: oldToken },
      revoked: false,
    },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: 'Family revoked due to rotation',
    },
  });

  // Create new token in same family
  const newToken = await createRefreshToken(tokenData.userId, tokenData.familyId, oldToken);

  return {
    newToken,
    familyId: tokenData.familyId,
    userId: tokenData.userId,
  };
}

/**
 * Revoke a refresh token (logout)
 */
export async function revokeRefreshToken(token: string, reason?: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: reason || 'Manually revoked',
    },
  });
}

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
export async function revokeAllUserTokens(userId: string, reason?: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false,
    },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: reason || 'All tokens revoked',
    },
  });
}

/**
 * Delete expired tokens (cleanup job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}

export async function deleteUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

