import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { mpesaService } from '../services/mpesa.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function mpesaWebhookRoutes(app: FastifyInstance) {
  // MPESA STK callback
  app.post('/mpesa', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;

      // Handle STK callback
      await mpesaService.handleSTKCallback(body);

      // MPESA requires 200 response
      return reply.send({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    } catch (error: any) {
      console.error('MPESA webhook error:', error);
      // Still return 200 to MPESA but log error
      return reply.send({
        ResultCode: 1,
        ResultDesc: 'Error processing',
      });
    }
  });

  // MPESA other callbacks (account balance, reversal, etc.)
  app.post('/mpesa/:eventType', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { eventType } = request.params as any;
      const body = request.body as any;

      // Log all callbacks
      await prisma.mpesaCallback.create({
        data: {
          payload: body,
          eventType,
          providerRef: body.TransactionID || body.ConversationID,
        },
      });

      // Handle specific event types
      if (eventType === 'reversal') {
        // Handle payment reversal
        // Implementation depends on business logic
      }

      return reply.send({ received: true });
    } catch (error: any) {
      console.error('MPESA callback error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });
}

