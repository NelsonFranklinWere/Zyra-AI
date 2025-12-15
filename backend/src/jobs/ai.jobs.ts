import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { followupQueue } from '../queues/index';
import { PrismaClient } from '@prisma/client';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { releaseOrderHold } from '../services/orders/order.ai';
import { paymentAI } from '../services/payments/payment.ai';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

/**
 * Start AI jobs workers
 */
export async function startAIWorkers(): Promise<void> {
  const redisConnection = getRedis();
  if (!redisConnection) {
    console.log('⚠️  Redis not available, AI workers will not start');
    return;
  }

  // Followup worker
  const followupWorker = new Worker(
    'followup',
    async (job: Job) => {
      await processFollowupJob(job);
    },
    {
      connection: {
        ...connection,
        maxRetriesPerRequest: null,
      },
      concurrency: 3,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 },
    }
  );

  followupWorker.on('completed', (job) => {
    console.log(`✅ Followup job completed: ${job.id}`);
  });

  followupWorker.on('failed', (job, err) => {
    console.error(`❌ Followup job failed: ${job?.id}`, err);
  });

  // Hold release worker
  const holdReleaseQueue = new Worker(
    'hold-release',
    async (job: Job) => {
      await processHoldReleaseJob(job);
    },
    {
      connection: {
        ...connection,
        maxRetriesPerRequest: null,
      },
      concurrency: 2,
    }
  );

  console.log('✅ AI workers started');
}

/**
 * Process followup job
 */
async function processFollowupJob(job: Job): Promise<void> {
  const { type, orderId, phone, message, conversationId, orgId } = job.data as any;

  switch (type) {
    case 'payment-reminder':
      await sendPaymentReminder(orderId, phone, message);
      break;

    case 'general-followup':
      await sendGeneralFollowup(conversationId, orgId, message);
      break;

    default:
      console.warn(`Unknown followup type: ${type}`);
  }
}

/**
 * Process hold release job
 */
async function processHoldReleaseJob(job: Job): Promise<void> {
  const { orderId } = job.data as any;
  await releaseOrderHold(orderId);
}

/**
 * Send payment reminder
 */
async function sendPaymentReminder(orderId: string, phone: string, message: string): Promise<void> {
  const provider = getWhatsAppProvider();
  try {
    await provider.sendText(phone, message);

    await prisma.aIProcessingTrace.create({
      data: {
        traceType: 'ACTION_EXECUTED',
        payload: {
          action: 'SEND_FOLLOWUP',
          type: 'payment-reminder',
          orderId,
        },
        success: true,
      },
    });
  } catch (error: any) {
    console.error('Failed to send payment reminder:', error);
    throw error;
  }
}

/**
 * Send general followup
 */
async function sendGeneralFollowup(conversationId: string, orgId: string, message: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const provider = getWhatsAppProvider();
  try {
    await provider.sendText(conversation.externalId, message);
  } catch (error: any) {
    console.error('Failed to send followup:', error);
    throw error;
  }
}

/**
 * Schedule followup job
 */
export async function scheduleFollowup(params: {
  type: string;
  delay?: number;
  data: any;
}): Promise<void> {
  await followupQueue.add(
    params.type,
    params.data,
    { delay: params.delay || 0 }
  );
}

