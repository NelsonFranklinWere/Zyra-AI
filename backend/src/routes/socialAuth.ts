import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';

export async function socialAuthRoutes(app: FastifyInstance) {
  // Facebook OAuth
  app.get(
    '/auth/facebook',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { accountId } = request.query as any;
      const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}&` +
        `scope=pages_read_engagement,pages_manage_posts&` +
        `state=${accountId}`;
      
      return reply.redirect(facebookAuthUrl);
    }
  );

  // Instagram OAuth (uses Facebook)
  app.get(
    '/auth/instagram',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { accountId } = request.query as any;
      const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${process.env.INSTAGRAM_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI!)}&` +
        `scope=user_profile,user_media&` +
        `response_type=code&` +
        `state=${accountId}`;
      
      return reply.redirect(instagramAuthUrl);
    }
  );

  // OAuth callback
  app.get(
    '/callback/:platform',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { platform } = request.params as any;
        const { code, state: accountId } = request.query as any;

        if (!code) {
          return reply.redirect('/dashboard/social?error=access_denied');
        }

        // Exchange code for access token
        let tokenUrl = '';
        let clientId = '';
        let clientSecret = '';
        let redirectUri = '';

        if (platform === 'facebook') {
          tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
          clientId = process.env.FACEBOOK_APP_ID!;
          clientSecret = process.env.FACEBOOK_APP_SECRET!;
          redirectUri = process.env.FACEBOOK_REDIRECT_URI!;
        } else if (platform === 'instagram') {
          tokenUrl = 'https://api.instagram.com/oauth/access_token';
          clientId = process.env.INSTAGRAM_APP_ID!;
          clientSecret = process.env.INSTAGRAM_APP_SECRET!;
          redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;
        }

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          // Update account as connected
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();
          
          await prisma.socialAccount.update({
            where: { id: accountId },
            data: { 
              connected: true,
              metadata: { accessToken: tokenData.access_token }
            },
          });

          return reply.redirect('/dashboard/social?success=connected');
        } else {
          return reply.redirect('/dashboard/social?error=token_failed');
        }
      } catch (error) {
        return reply.redirect('/dashboard/social?error=callback_failed');
      }
    }
  );
}