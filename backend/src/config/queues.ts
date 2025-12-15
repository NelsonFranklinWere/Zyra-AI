import { Queue } from 'bullmq';
import { getRedis } from './redis';

let redisConnection: ReturnType<typeof getRedis>;

export async function initializeQueues(): Promise<void> {
  redisConnection = getRedis();
  if (redisConnection) {
    console.log('✅ Queues initialized');
  } else {
    console.log('⚠️  Redis not configured, queues will not work');
  }
}

// Queues are now defined in queues/index.ts
export { messageQueue, followupQueue } from '../queues';

