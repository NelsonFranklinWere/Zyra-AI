import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getOrCreateConversation, saveInboundMessage } from '../services/message.service';
import { messageQueue } from '../queues';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/template.service';
import { validateTemplateContent } from '../services/templateApproval.service';
import { listOrders, getOrder } from '../services/order.service';
import { simulatePaymentSuccess } from '../services/payment.service';
import { getAnalyticsEvents } from '../services/analytics.service';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess, requireRole } from '../middleware/roleGuard';
import { processMessage } from '../services/messageProcessor';

const prisma = new PrismaClient();

// Simulate inbound message
export async function simulateMessage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { from, message, orgId: inputOrgId } = request.body as any;
    const user = (request as any).user;
    const orgId = inputOrgId || user.orgId;

    if (!orgId) {
      return reply.code(400).send({
        success: false,
        message: 'Organization ID required',
      });
    }

    if (!from || !message) {
      return reply.code(400).send({
        success: false,
        message: 'from and message required',
      });
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(orgId, from, 'whatsapp');

    // Save message
    const savedMessage = await saveInboundMessage(conversation.id, from, message, {
      simulated: true,
      simulatedBy: user.userId,
    });

    // Process the message
    const result = await processMessage(orgId, message, from);

    return reply.send({
      success: true,
      messageId: savedMessage.id,
      conversationId: conversation.id,
      processing: result,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

// Simulate payment success
export async function simulatePayment(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { attemptId } = request.params as any;
    await simulatePaymentSuccess(attemptId);

    return reply.send({
      success: true,
      message: 'Payment simulated successfully',
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

// Get conversation audit trace
export async function getConversationAudit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any;
    const user = (request as any).user;
    const orgId = (request as any).orgId || user.orgId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        orgId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return reply.code(404).send({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Get processing traces for messages
    const messageIds = conversation.messages.map((m) => m.id);
    const traces = await prisma.processingTrace.findMany({
      where: {
        messageId: { in: messageIds },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({
      success: true,
      data: {
        conversation,
        processingTraces: traces,
      },
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

// Templates CRUD
export async function getTemplates(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const templates = await listTemplates(orgId);
    return reply.send({ success: true, data: templates });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function createTemplateHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const body = request.body as any;
    const user = (request as any).user;

    // Validate template content
    if (body.content) {
      const validation = await validateTemplateContent(body.content);
      if (!validation.valid) {
        return reply.code(400).send({
          success: false,
          message: 'Template validation failed',
          errors: validation.errors,
        });
      }
    }

    // Determine status based on sensitive flag and user role
    const status = body.sensitive || user.role === 'STAFF' ? 'pending_approval' : 'draft';

    const template = await createTemplate(orgId, {
      ...body,
      status,
    });
    return reply.code(201).send({ success: true, data: template });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function updateTemplateHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const { name } = request.params as any;
    const body = request.body as any;
    const template = await updateTemplate(orgId, name, body);
    return reply.send({ success: true, data: template });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function deleteTemplateHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const { name } = request.params as any;
    await deleteTemplate(orgId, name);
    return reply.send({ success: true, message: 'Template deleted' });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

// Orders
export async function getOrdersList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const filters = {
      status: (request.query as any)?.status,
      limit: parseInt((request.query as any)?.limit || '100'),
    };
    const orders = await listOrders(orgId, filters);
    return reply.send({ success: true, data: orders });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function getOrderDetails(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const { id } = request.params as any;
    const order = await getOrder(id, orgId);
    
    if (!order) {
      return reply.code(404).send({ success: false, message: 'Order not found' });
    }

    return reply.send({ success: true, data: order });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

// Rules CRUD (extend existing)
export async function getRules(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const rules = await prisma.conversationRule.findMany({
      where: { orgId },
      orderBy: { priority: 'desc' },
    });
    return reply.send({ success: true, data: rules });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function createRule(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const body = request.body as any;
    
    const rule = await prisma.conversationRule.upsert({
      where: {
        orgId_key: {
          orgId,
          key: body.key,
        },
      },
      update: {
        value: body.value,
      },
      create: {
        orgId,
        key: body.key,
        value: body.value,
      },
    });

    return reply.code(201).send({ success: true, data: rule });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function updateRule(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const { id: key } = request.params as any; // Using key as parameter
    const body = request.body as any;

    const rule = await prisma.conversationRule.upsert({
      where: {
        orgId_key: {
          orgId,
          key,
        },
      },
      update: {
        value: body.value,
      },
      create: {
        orgId,
        key,
        value: body.value,
      },
    });

    return reply.send({ success: true, data: rule });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

export async function deleteRule(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const { id: key } = request.params as any; // Using key as parameter
    
    await prisma.conversationRule.deleteMany({
      where: { orgId, key },
    });
    
    return reply.send({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

// Analytics
export async function getAnalytics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orgId = (request as any).orgId;
    const filters = {
      eventType: (request.query as any)?.eventType,
      limit: parseInt((request.query as any)?.limit || '100'),
      since: (request.query as any)?.since ? new Date((request.query as any).since) : undefined,
    };
    const events = await getAnalyticsEvents(orgId, filters);
    return reply.send({ success: true, data: events });
  } catch (error: any) {
    return reply.code(500).send({ success: false, message: error.message });
  }
}

