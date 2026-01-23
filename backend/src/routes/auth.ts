import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authGuard } from '../middleware/authGuard';
import { createRefreshToken, rotateRefreshToken, revokeAllUserTokens, deleteRefreshToken } from '../services/refreshToken';
import { createAuditLog } from '../services/auditLog';
import { registerSchema, loginSchema } from '@zyra/shared';
import { createInvite, acceptInvite, resendInvite, cancelInvite } from '../services/invite.service';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post(
    '/register',
    async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      try {
        const body = registerSchema.parse(request.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: body.email },
        });

        if (existingUser) {
          return reply.code(400).send({
            success: false,
            message: 'User already exists',
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(body.password, 10);

        // Create user first (without orgId)
        const user = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            passwordHash,
            role: 'OWNER',
          },
        });

        // Create organization for the user
        const organization = await prisma.organization.create({
          data: {
            name: `${body.name}'s Business`, // Default org name
            ownerId: user.id,
            automationEnabled: true,
          },
        });

        // Update user with orgId
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { orgId: organization.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            orgId: true,
            createdAt: true,
          },
        });

        // Generate JWT
        const token = app.jwt.sign({
          userId: updatedUser.id,
          role: updatedUser.role,
          orgId: updatedUser.orgId,
        });

        // Create refresh token
        const refreshToken = await createRefreshToken(updatedUser.id);

        // Set httpOnly cookies
        reply.setCookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
        });

        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        await createAuditLog({
          userId: updatedUser.id,
          orgId: updatedUser.orgId,
          action: 'USER_REGISTERED',
          resource: 'user',
          resourceId: updatedUser.id,
        });

        return reply.code(201).send({
          success: true,
          data: {
            user: updatedUser,
            organization,
            token,
            refreshToken,
          },
        });
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.code(400).send({
            success: false,
            message: 'Validation error',
            errors: error.errors,
          });
        }

        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // Login
  app.post(
    '/login',
    async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      try {
        const body = loginSchema.parse(request.body);

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: body.email },
        });

        if (!user) {
          return reply.code(401).send({
            success: false,
            message: 'Invalid credentials',
          });
        }

        // Verify password
        const valid = await bcrypt.compare(body.password, user.passwordHash);

        if (!valid) {
          return reply.code(401).send({
            success: false,
            message: 'Invalid credentials',
          });
        }

        // Generate JWT
        const token = app.jwt.sign({
          userId: user.id,
          role: user.role,
          orgId: user.orgId,
        });

        // Create refresh token
        const refreshToken = await createRefreshToken(user.id);

        // Set httpOnly cookies
        reply.setCookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
        });

        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        await createAuditLog({
          userId: user.id,
          orgId: user.orgId || undefined,
          action: 'USER_LOGIN',
          resource: 'user',
          resourceId: user.id,
        });

        return reply.send({
          success: true,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              orgId: user.orgId,
              createdAt: user.createdAt,
            },
            token,
            refreshToken,
          },
        });
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.code(400).send({
            success: false,
            message: 'Validation error',
            errors: error.errors,
          });
        }

        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // Get current user (protected)
  app.get('/me', { preHandler: [authGuard] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  members: true,
                  products: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'User not found',
        });
      }

      return reply.send({
        success: true,
        data: user,
      });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Refresh token (with rotation)
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Rotate token (invalidates old, creates new)
      const rotated = await rotateRefreshToken(refreshToken);

      if (!rotated) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: rotated.userId },
        select: {
          id: true,
          role: true,
          orgId: true,
        },
      });

      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'User not found',
        });
      }

      // Generate new access token
      const token = app.jwt.sign({
        userId: user.id,
        role: user.role,
        orgId: user.orgId,
      });

      // Set new refresh token cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      reply.setCookie('refreshToken', rotated.newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return reply.send({
        success: true,
        data: { token, refreshToken: rotated.newToken },
      });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Revoke all tokens (logout all devices)
  app.post('/revoke-all', { preHandler: [authGuard] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      await revokeAllUserTokens(userId, 'User requested logout all devices');

      reply.clearCookie('token', { path: '/' });
      reply.clearCookie('refreshToken', { path: '/' });

      return reply.send({
        success: true,
        message: 'All sessions revoked',
      });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Logout
  app.post('/logout', { preHandler: [authGuard] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshToken = request.cookies.refreshToken;
      if (refreshToken) {
        await deleteRefreshToken(refreshToken);
      }

      reply.clearCookie('token', { path: '/' });
      reply.clearCookie('refreshToken', { path: '/' });

      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Accept invite (public endpoint)
  app.post('/accept-invite', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, password } = request.body as any;

      if (!token || !password) {
        return reply.code(400).send({
          success: false,
          message: 'Token and password required',
        });
      }

      const result = await acceptInvite(token, password);

      return reply.send({
        success: true,
        data: result.user,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Failed to accept invite',
      });
    }
  });
}
