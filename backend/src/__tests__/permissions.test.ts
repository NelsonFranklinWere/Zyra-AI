import { getUserPermissions, hasPermission } from '../middleware/permissions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPermissions', () => {
    it('should return default OWNER permissions', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'OWNER',
        permissions: null,
        orgId: 'org-123',
      });

      const permissions = await getUserPermissions('user-123', 'org-123');

      expect(permissions.canSendMessages).toBe(true);
      expect(permissions.canManageUsers).toBe(true);
      expect(permissions.canManageSettings).toBe(true);
    });

    it('should return default ADMIN permissions', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'ADMIN',
        permissions: null,
        orgId: 'org-123',
      });

      const permissions = await getUserPermissions('user-123', 'org-123');

      expect(permissions.canSendMessages).toBe(true);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canManageSettings).toBe(false);
    });

    it('should override with custom permissions', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'STAFF',
        permissions: {
          canManageUsers: true, // Override default STAFF permissions
        },
        orgId: 'org-123',
      });

      const permissions = await getUserPermissions('user-123', 'org-123');

      expect(permissions.canManageUsers).toBe(true);
      expect(permissions.canSendMessages).toBe(true);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'OWNER',
        permissions: null,
        orgId: 'org-123',
      });

      const result = await hasPermission('user-123', 'canSendMessages', 'org-123');
      expect(result).toBe(true);
    });

    it('should return false if user lacks permission', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        role: 'STAFF',
        permissions: null,
        orgId: 'org-123',
      });

      const result = await hasPermission('user-123', 'canManageUsers', 'org-123');
      expect(result).toBe(false);
    });
  });
});

