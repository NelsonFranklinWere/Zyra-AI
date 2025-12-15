import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios, { AxiosInstance } from 'axios';
import { IWhatsAppProvider, WhatsAppSendOptions } from './types';
import { env } from '../../env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Dialog360Provider implements IWhatsAppProvider {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = env.WA_API_KEY || process.env.DIALOG360_API_KEY || '';
    this.apiUrl = process.env.DIALOG360_API_URL || 'https://waba.360dialog.io/v1';

    if (!this.apiKey) {
      console.warn('⚠️  360dialog provider: Missing DIALOG360_API_KEY');
    }

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'D360-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  name(): string {
    return '360dialog';
  }

  async sendText(
    to: string,
    text: string,
    options?: WhatsAppSendOptions
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/messages', {
        to: this.normalizePhone(to),
        type: 'text',
        text: {
          body: text,
        },
      });

      const messageId = response.data.messages?.[0]?.id;

      await this.logOutgoingMessage(to, text, messageId, 'text');

      return messageId || `360dialog_${Date.now()}`;
    } catch (error: any) {
      console.error('360dialog sendText error:', error.response?.data || error.message);
      
      await this.logOutgoingMessage(to, text, null, 'text', error.message);

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
      const orgId = process.env.DEFAULT_ORG_ID || '';
      const template = await prisma.template.findFirst({
        where: {
          name: templateName,
          orgId,
          isWhatsappTemplate: true,
        },
      });

      if (!template?.providerTemplateId) {
        throw new Error(`Template ${templateName} not registered with 360dialog`);
      }

      const components = Object.keys(variables).map((key) => ({
        type: 'text',
        text: variables[key],
      }));

      const response = await this.apiClient.post('/messages', {
        to: this.normalizePhone(to),
        type: 'template',
        template: {
          name: template.providerTemplateId,
          language: { code: 'en' },
          components: components.length > 0 ? [{ type: 'body', parameters: components }] : undefined,
        },
      });

      const messageId = response.data.messages?.[0]?.id;

      await this.logOutgoingMessage(to, `[Template: ${templateName}]`, messageId, 'template', undefined, templateName);

      return messageId || `360dialog_${Date.now()}`;
    } catch (error: any) {
      console.error('360dialog sendTemplate error:', error.response?.data || error.message);
      await this.logOutgoingMessage(to, `[Template: ${templateName}]`, null, 'template', error.message, templateName);
      throw error;
    }
  }

  registerWebhook(app: FastifyInstance): void {
    // 360dialog webhook verification
    app.get('/whatsapp/verify', async (request: FastifyRequest, reply: FastifyReply) => {
      // 360dialog may use different verification - check their docs
      const token = (request.query as any).token;
      if (token === env.WA_WEBHOOK_VERIFY_TOKEN) {
        return reply.send({ verified: true });
      }
      return reply.code(403).send({ error: 'Verification failed' });
    });

    // Status webhooks
    app.post('/whatsapp/status', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        
        // Process status updates
        if (body.messages) {
          for (const msg of body.messages) {
            await this.handleStatusUpdate(msg);
          }
        }

        return reply.send({ received: true });
      } catch (error: any) {
        console.error('360dialog status webhook error:', error);
        return reply.code(500).send({ error: error.message });
      }
    });
  }

  private async handleStatusUpdate(status: any) {
    const messageId = status.id;
    const statusValue = status.status;

    await prisma.outgoingMessage.updateMany({
      where: { providerRef: messageId },
      data: {
        status: this.mapStatus(statusValue),
        metadata: {
          statusDetails: status,
          updatedAt: new Date(),
        },
      },
    });
  }

  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'delivered',
      failed: 'failed',
    };
    return statusMap[status] || 'pending';
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
      const orgId = process.env.DEFAULT_ORG_ID || '';
      
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
            provider: '360dialog',
            type,
          },
        },
      });
    } catch (err) {
      console.error('Failed to log outgoing message:', err);
    }
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[\s+]/g, '');
  }
}

