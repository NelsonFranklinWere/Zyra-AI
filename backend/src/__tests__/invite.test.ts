import { createInvite, acceptInvite, resendInvite, cancelInvite } from '../services/invite.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Invite Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvite', () => {
    it('should create an invite for a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.upsert as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await createInvite({
        email: 'test@example.com',
        name: 'Test User',
        orgId: 'org-123',
        role: 'STAFF',
        invitedBy: 'owner-123',
      });

      expect(result.inviteToken).toBeDefined();
      expect(result.inviteUrl).toContain(result.inviteToken);
    });

    it('should throw error if user already exists in org', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        orgId: 'org-123',
      });

      await expect(
        createInvite({
          email: 'test@example.com',
          name: 'Test User',
          orgId: 'org-123',
          role: 'STAFF',
          invitedBy: 'owner-123',
        })
      ).rejects.toThrow('User already exists in this organization');
    });
  });

  describe('acceptInvite', () => {
    it('should accept invite and set password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        inviteToken: 'valid-token',
        inviteExpiresAt: new Date(Date.now() + 86400000), // 1 day from now
        passwordHash: null,
        orgId: 'org-123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'STAFF',
        orgId: 'org-123',
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await acceptInvite('valid-token', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({
            passwordHash: expect.any(String),
            inviteToken: null,
          }),
        })
      );
    });

    it('should throw error for invalid token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(acceptInvite('invalid-token', 'password123')).rejects.toThrow(
        'Invalid invite token'
      );
    });

    it('should throw error for expired token', async () => {
      const mockUser = {
        id: 'user-123',
        inviteToken: 'expired-token',
        inviteExpiresAt: new Date(Date.now() - 86400000), // 1 day ago
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(acceptInvite('expired-token', 'password123')).rejects.toThrow(
        'Invite token has expired'
      );
    });
  });
});

