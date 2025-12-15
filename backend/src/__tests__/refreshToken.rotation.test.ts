import {
  createRefreshToken,
  rotateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from '../services/refreshToken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Refresh Token Rotation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRefreshToken', () => {
    it('should create a token with family ID', async () => {
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        token: 'new-token',
        familyId: 'family-123',
      });

      const token = await createRefreshToken('user-123');

      expect(token).toBeDefined();
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-123',
            familyId: expect.any(String),
          }),
        })
      );
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate token and revoke old one', async () => {
      const oldToken = 'old-token-123';
      const mockToken = {
        id: 'token-1',
        token: oldToken,
        userId: 'user-123',
        familyId: 'family-123',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: false,
        user: { id: 'user-123' },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        token: 'new-token-456',
        familyId: 'family-123',
      });

      const result = await rotateRefreshToken(oldToken);

      expect(result).toBeDefined();
      expect(result?.newToken).toBe('new-token-456');
      expect(result?.familyId).toBe('family-123');
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: oldToken },
          data: expect.objectContaining({
            revoked: true,
          }),
        })
      );
    });

    it('should return null for invalid token', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await rotateRefreshToken('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid token', async () => {
      const mockToken = {
        id: 'token-1',
        token: 'valid-token',
        userId: 'user-123',
        familyId: 'family-123',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: false,
        user: { id: 'user-123' },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

      const result = await verifyRefreshToken('valid-token');

      expect(result).toEqual({
        userId: 'user-123',
        familyId: 'family-123',
      });
    });

    it('should return null for revoked token', async () => {
      const mockToken = {
        id: 'token-1',
        token: 'revoked-token',
        userId: 'user-123',
        familyId: 'family-123',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: true,
        user: { id: 'user-123' },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

      const result = await verifyRefreshToken('revoked-token');
      expect(result).toBeNull();
    });
  });
});

