import { Worker } from 'bullmq';
import { getRedis } from '../config/redis';
import { mpesaService } from '../services/mpesa.service';
import { reconciliationQueue } from '../queues';

export async function startReconciliationWorker() {
  const redis = getRedis();
  if (!redis) {
    console.log('⚠️  Redis not available, reconciliation worker will not start');
    return;
  }

  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  };

  const worker = new Worker(
    'payment-reconciliation',
    async (job) => {
      const { since } = job.data;
      const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      console.log(`🔍 Starting payment reconciliation since ${sinceDate.toISOString()}`);

      const result = await mpesaService.reconcilePayments(sinceDate);

      console.log(`✅ Reconciled ${result.reconciled} payments, ${result.unmatched.length} unmatched`);

      return result;
    },
    {
      connection,
      concurrency: 1,
    }
  );

  // Schedule periodic reconciliation (every hour)
  setInterval(async () => {
    await reconciliationQueue.add('reconcile', {
      since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });
  }, 60 * 60 * 1000);

  console.log('✅ Reconciliation worker started');
}

