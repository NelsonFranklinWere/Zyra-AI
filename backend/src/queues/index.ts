import { Worker, Queue, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { processMessage } from './message.processor.v2';
import { env } from '../env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function moveToDeadLetterQueue(job: Job | undefined, error: Error) {
  if (!job) return;

  try {
    await prisma.deadLetterJob.create({
      data: {
        queueName: 'message-processing',
        jobId: job.id || '',
        payload: job.data as any,
        error: error.message,
        stackTrace: error.stack,
        retryCount: job.attemptsMade || 0,
        orgId: (job.data as any)?.orgId,
        status: 'pending',
      },
    });

    // Flag conversation for human review
    const messageId = (job.data as any)?.messageId;
    if (messageId) {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
      });

      if (message?.conversation) {
        await prisma.conversation.update({
          where: { id: message.conversation.id },
          data: { requiresHuman: true },
        });
      }
    }
  } catch (err) {
    console.error('Failed to move job to DLQ:', err);
  }
}

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const messageQueue = new Queue('message-processing', {
  connection: {
    ...connection,
    maxRetriesPerRequest: null,
  },
});

export const followupQueue = new Queue('followup', {
  connection: {
    ...connection,
    maxRetriesPerRequest: null,
  },
});

let messageWorker: Worker | null = null;
let followupWorker: Worker | null = null;

export async function startWorkers(): Promise<void> {
  const redisConnection = getRedis();
  if (!redisConnection) {
    console.log('⚠️  Redis not available, workers will not start');
    return;
  }

  // Message processing worker
  messageWorker = new Worker(
    'message-processing',
    async (job) => {
      await processMessage(job);
    },
    {
      connection: {
        ...connection,
        maxRetriesPerRequest: null,
      },
      concurrency: 5,
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100,
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    }
  );

  messageWorker.on('completed', (job) => {
    console.log(`✅ Message processed: ${job.id}`);
  });

  messageWorker.on('failed', async (job, err) => {
    console.error(`❌ Message processing failed: ${job?.id}`, err);
    
    // Move to dead letter queue after max retries
    if (job?.attemptsMade && job.attemptsMade >= (parseInt(env.BULL_RETRY_ATTEMPTS?.toString() || '3'))) {
      await moveToDeadLetterQueue(job, err);
    }
  });

  // Followup worker (placeholder for Sprint 2)
  followupWorker = new Worker(
    'followup',
    async (job) => {
      // Implement followup logic in future sprints
      console.log('Followup job:', job.data);
    },
    {
      connection: {
        ...connection,
        maxRetriesPerRequest: null,
      },
      concurrency: 2,
    }
  );

  // Start stock reservation worker (if exists)
  try {
    const { startStockReservationWorker } = await import('../workers/stockReservation.worker');
    await startStockReservationWorker();
  } catch (e) {
    // Worker may not exist yet
  }

  // Start reconciliation worker (if exists)
  try {
    const { startReconciliationWorker } = await import('../workers/reconciliation.worker');
    await startReconciliationWorker();
  } catch (e) {
    // Worker may not exist yet
  }

  // Start AI workers
  try {
    const { startAIWorkers } = await import('../jobs/ai.jobs');
    await startAIWorkers();
  } catch (e) {
    console.warn('AI workers not available:', e);
  }

  console.log('✅ Workers started');
}

export async function stopWorkers(): Promise<void> {
  await messageWorker?.close();
  await followupWorker?.close();
  console.log('Workers stopped');
}

