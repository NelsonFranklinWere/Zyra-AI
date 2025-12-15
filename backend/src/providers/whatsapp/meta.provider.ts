import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { IWhatsAppProvider, WhatsAppSendOptions } from './types';
import { env } from '../../env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private apiClient: AxiosInstance;
  private phoneNumberId: string;
  private businessAccountId: string;
  private accessToken: string;
  private webhookVerifyToken: string;

  constructor() {
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID || '';
    this.businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID || '';
    this.accessToken = env.WA_API_KEY || process.env.META_ACCESS_TOKEN || '';
    this.webhookVerifyToken = env.WA_WEBHOOK_VERIFY_TOKEN || 'changeme';

    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('⚠️  Meta WhatsApp provider: Missing required env vars (META_ACCESS_TOKEN, META_PHONE_NUMBER_ID)');
    }

    this.apiClient = axios.create({
      baseURL: `https://graph.facebook.com/v18.0/${this.phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  name(): string {
    return 'meta';
  }

  async sendText(
    to: string,
    text: string,
    options?: WhatsAppSendOptions
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/messages', {
        messaging_product: 'whatsapp',
        to: this.normalizePhone(to),
        type: 'text',
        text: {
          body: text,
        },
      });

      const messageId = response.data.messages?.[0]?.id;

      // Log to outgoing_messages
      await this.logOutgoingMessage(to, text, messageId, 'text');

      return messageId || `meta_${Date.now()}`;
    } catch (error: any) {
      console.error('Meta sendText error:', error.response?.data || error.message);
      
      // Log error
      await this.logOutgoingMessage(to, text, null, 'text', error.message);

      // Handle rate limits
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || '60';
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }

      throw error;
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<string> {
    try {
      // Get template from DB to get provider_template_id
      const orgId = process.env.DEFAULT_ORG_ID || ''; // Would come from context
      const template = await prisma.template.findFirst({
        where: {
          name: templateName,
          orgId,
          isWhatsappTemplate: true,
        },
      });

      if (!template?.providerTemplateId) {
        throw new Error(`Template ${templateName} not found or not registered with Meta`);
      }

      // Convert variables to Meta format
      const components = Object.keys(variables).map((key, index) => ({
        type: 'text',
        text: variables[key],
      }));

      const response = await this.apiClient.post('/messages', {
        messaging_product: 'whatsapp',
        to: this.normalizePhone(to),
        type: 'template',
        template: {
          name: template.providerTemplateId,
          language: { code: 'en' },
          components: components.length > 0 ? [{ type: 'body', parameters: components }] : undefined,
        },
      });

      const messageId = response.data.messages?.[0]?.id;

      await this.logOutgoingMessage(
        to,
        `[Template: ${templateName}]`,
        messageId,
        'template',
        undefined,
        templateName
      );

      return messageId || `meta_${Date.now()}`;
    } catch (error: any) {
      console.error('Meta sendTemplate error:', error.response?.data || error.message);
      await this.logOutgoingMessage(to, `[Template: ${templateName}]`, null, 'template', error.message, templateName);
      throw error;
    }
  }

  registerWebhook(app: FastifyInstance): void {
    // Webhook verification (GET)
    app.get('/whatsapp/verify', async (request: FastifyRequest, reply: FastifyReply) => {
      const mode = (request.query as any).hub.mode;
      const token = (request.query as any).hub.verify_token;
      const challenge = (request.query as any).hub.challenge;

      if (mode === 'subscribe' && token === this.webhookVerifyToken) {
        return reply.send(challenge);
      }

      return reply.code(403).send({ error: 'Verification failed' });
    });

    // Webhook handler (POST) - status callbacks
    app.post('/whatsapp/status', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        
        // Verify signature
        const signature = request.headers['x-hub-signature-256'] as string;
        if (!this.verifySignature(JSON.stringify(body), signature)) {
          return reply.code(401).send({ error: 'Invalid signature' });
        }

        // Process status updates
        const entry = body.entry?.[0];
        const changes = entry?.changes || [];

        for (const change of changes) {
          if (change.value?.statuses) {
            for (const status of change.value.statuses) {
              await this.handleStatusUpdate(status);
            }
          }
        }

        return reply.send({ received: true });
      } catch (error: any) {
        console.error('Status webhook error:', error);
        return reply.code(500).send({ error: error.message });
      }
    });
  }

  private async handleStatusUpdate(status: any) {
    const messageId = status.id;
    const statusValue = status.status; // sent, delivered, read, failed

    // Update outgoing_messages table
    await prisma.outgoingMessage.updateMany({
      where: { providerRef: messageId },
      data: {
        status: statusValue === 'sent' ? 'sent' : statusValue === 'delivered' ? 'delivered' : statusValue === 'read' ? 'delivered' : 'failed',
        metadata: {
          statusDetails: status,
          updatedAt: new Date(),
        },
      },
    });
  }

  private async logOutgoingMessage(
    to: string,
    text: string,
    messageId: string | null,
    type: string,
    error?: string,
    template?: string
  ) {
    try {
      const orgId = process.env.DEFAULT_ORG_ID || ''; // Would come from context
      
      await prisma.outgoingMessage.create({
        data: {
          orgId,
          to,
          text,
          template,
          status: error ? 'failed' : 'pending',
          providerRef: messageId,
          error,
          metadata: {
            provider: 'meta',
            type,
          },
        },
      });
    } catch (err) {
      console.error('Failed to log outgoing message:', err);
    }
  }

  private normalizePhone(phone: string): string {
    // Remove + and spaces, ensure format is correct for Meta
    return phone.replace(/[\s+]/g, '');
  }

  private verifySignature(payload: string, signature: string): boolean {
    if (!signature) return false;

    const appSecret = process.env.META_APP_SECRET || env.WA_API_KEY || '';
    if (!appSecret) {
      console.warn('⚠️  Meta webhook signature verification disabled: META_APP_SECRET not set');
      return true; // Allow if secret not configured
    }

    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );
  }

  // Register template with Meta (background job)
  async registerTemplate(orgId: string, templateName: string): Promise<string> {
    const template = await prisma.template.findFirst({
      where: { name: templateName, orgId },
    });

    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Meta template registration API call
    // This is a placeholder - actual implementation would call Meta's template API
    try {
      const response = await this.apiClient.post(
        `/${this.businessAccountId}/message_templates`,
        {
          name: templateName,
          category: 'MARKETING', // or 'UTILITY', 'AUTHENTICATION'
          language: 'en',
          components: [
            {
              type: 'BODY',
              text: template.content, // Would need to parse variables
            },
          ],
        }
      );

      const providerTemplateId = response.data.id;

      // Update template
      await prisma.template.update({
        where: { id: template.id },
        data: {
          providerTemplateId,
          status: 'pending_approval', // Meta requires approval
        },
      });

      return providerTemplateId;
    } catch (error: any) {
      console.error('Meta template registration error:', error.response?.data || error.message);
      throw error;
    }
  }
}
