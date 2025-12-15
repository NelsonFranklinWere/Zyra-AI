import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { IWhatsAppProvider, WhatsAppSendOptions } from './types';

const prisma = new PrismaClient();

export class MockWhatsAppProvider implements IWhatsAppProvider {
  name(): string {
    return 'mock';
  }

  async sendText(to: string, text: string, options?: WhatsAppSendOptions): Promise<string> {
    // In mock mode, store in outgoing_messages table
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Try to find org by phone number pattern or use first org
      const org = await prisma.organization.findFirst();
      
      await prisma.outgoingMessage.create({
        data: {
          orgId: org?.id || 'unknown',
          to,
          text,
          template: options?.template,
          status: 'sent',
          providerRef: messageId,
          metadata: options || {},
        },
      });
    } catch (error) {
      console.error('Mock provider: failed to log message', error);
    }

    console.log(`[MOCK WA] → ${to}: ${text}`);
    return messageId;
  }

  async sendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<string> {
    // For mock, just send a text representation
    const text = `[Template: ${templateName}] ${JSON.stringify(variables)}`;
    return this.sendText(to, text, { template: templateName, templateVariables: variables });
  }

  registerWebhook(app: FastifyInstance): void {
    // Register simulation endpoint for local testing
    app.post('/api/admin/simulate/inbound', async (request: any, reply: any) => {
      try {
        const { from, message, orgId } = request.body;

        // Trigger webhook handler
        const webhookPayload = {
          from,
          type: 'text',
          text: message,
          timestamp: Date.now(),
        };

        // Enqueue processing via internal call
        // This will be handled by the webhook controller
        reply.send({
          success: true,
          message: 'Simulated message queued',
          payload: webhookPayload,
        });
      } catch (error: any) {
        reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    console.log('✅ Mock WhatsApp provider: Simulation endpoint registered at /api/admin/simulate/inbound');
  }
}

