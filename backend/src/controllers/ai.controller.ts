import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { classifyIntent } from '../services/intent/intent.classifier';
import { parseMessage } from '../services/ai/mue';
import { generateReply } from '../services/ai/reply.generator';
import { processOrderFlow } from '../services/orders/order.ai';
import { processSocialComment } from '../services/social/comment.ai';
import { getBusinessMemory, updateBusinessMemory } from '../services/ai/memory';
import { executeAction, ActionType } from '../services/ai/actions';
import { generateTraceId } from '../lib/trace';

const prisma = new PrismaClient();

/**
 * Simulate message processing (for testing)
 */
export async function simulateMessage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const { message, conversationId } = request.body as any;

    const traceId = generateTraceId();

    // Get products
    const products = await prisma.product.findMany({
      where: { orgId, isActive: true },
    });

    // Classify intent
    const intent = await classifyIntent({
      message,
      orgId,
      conversationId,
      traceId,
    });

    // Parse message
    const parsed = await parseMessage({
      message,
      orgId,
      products,
      conversationId,
      traceId,
    });

    // Generate reply
    const replyResult = await generateReply({
      intent: intent.intent,
      parsedFields: parsed,
      conversationId,
      orgId,
      message,
      traceId,
    });

    return reply.send({
      success: true,
      data: {
        traceId,
        intent,
        parsed,
        reply: replyResult,
      },
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get processing traces for conversation
 */
export async function getTraces(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const { conversationId, traceType } = request.query as any;

    const traces = await prisma.aIProcessingTrace.findMany({
      where: {
        orgId,
        ...(conversationId && { conversationId }),
        ...(traceType && { traceType }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return reply.send({
      success: true,
      data: traces,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get business memory
 */
export async function getBusinessMemoryHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const memory = await getBusinessMemory(orgId);

    return reply.send({
      success: true,
      data: memory,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Update business memory
 */
export async function updateBusinessMemoryHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const body = request.body as any;

    const memory = await updateBusinessMemory(orgId, {
      faqs: body.faqs,
      instructions: body.instructions,
      negotiationRules: body.negotiationRules,
      deliveryRules: body.deliveryRules,
    });

    return reply.send({
      success: true,
      data: memory,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Process social comment
 */
export async function processComment(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const comment = request.body as any;

    const result = await processSocialComment({
      comment,
      orgId,
    });

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Replay action for a message (re-run action processor)
 */
export async function replayAction(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { orgId } = (request as any);
    const { messageId, action } = request.body as any;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message || message.conversation?.orgId !== orgId) {
      return reply.code(404).send({
        success: false,
        message: 'Message not found',
      });
    }

    const result = await executeAction(action as ActionType, {
      orgId,
      conversationId: message.conversationId,
      messageId,
      parsedFields: {},
    });

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
}

