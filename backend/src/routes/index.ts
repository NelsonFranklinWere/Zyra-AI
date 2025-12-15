import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { webhookRoutes } from './webhooks';
import { organizationRoutes } from './organizations';
import { inviteRoutes } from './organizations.invites';
import { productRoutes } from './products';
import { rulesRoutes } from './rules';
import { adminRoutes } from './admin';
import { healthRoutes } from './health';
import { mpesaWebhookRoutes } from './mpesa.webhooks';
import { aiRoutes } from './ai.routes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Auth routes
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Organization routes
  await app.register(organizationRoutes, { prefix: '/api/org' });

  // Organization invite routes
  await app.register(inviteRoutes, { prefix: '/api/org' });

  // Product routes
  await app.register(productRoutes, { prefix: '/api/products' });

  // Rules routes (legacy, kept for compatibility)
  await app.register(rulesRoutes, { prefix: '/api/rules' });

  // Admin routes (includes rules, templates, simulate, orders, analytics)
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // Webhook routes
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });

  // MPESA webhook routes
  await app.register(mpesaWebhookRoutes, { prefix: '/api/webhooks' });

  // Health & metrics routes
  await app.register(healthRoutes);

  // AI routes
  await app.register(aiRoutes, { prefix: '/api/ai' });
}

