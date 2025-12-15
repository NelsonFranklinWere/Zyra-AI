import { FastifyInstance } from 'fastify';
import { verifyWebhook, handleWhatsAppWebhook } from '../controllers/webhook.controller';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { phoneRateLimiter } from '../middleware/rateLimiterAdvanced';
import { webhookSecurity } from '../middleware/webhookSecurity';

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook verification (GET)
  app.get('/whatsapp/verify', verifyWebhook);

  // WhatsApp webhook handler (POST) with security and rate limiting
  app.post(
    '/whatsapp',
    {
      preHandler: [
        webhookSecurity({ verifySignature: true, timestampTolerance: 60, replayProtection: true }),
        phoneRateLimiter(),
      ],
    },
    handleWhatsAppWebhook
  );

  // Register provider webhook routes
  const provider = getWhatsAppProvider();
  provider.registerWebhook(app);
}
