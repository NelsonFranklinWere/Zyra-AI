import { PrismaClient } from '@prisma/client';
import { messageQueue, followupQueue } from '../queues';

const prisma = new PrismaClient();

export interface SystemMetrics {
  messages: {
    inbound: number;
    outbound: number;
    processed: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
  queues: {
    messageProcessing: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  database: {
    connections: number;
  };
  redis: {
    connected: boolean;
  };
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  // Message counts (last 24 hours)
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const [inboundCount, outboundCount, processedCount] = await Promise.all([
    prisma.message.count({
      where: {
        direction: 'inbound',
        createdAt: { gte: last24h },
      },
    }),
    prisma.message.count({
      where: {
        direction: 'outbound',
        createdAt: { gte: last24h },
      },
    }),
    prisma.message.count({
      where: {
        processedAt: { not: null, gte: last24h },
      },
    }),
  ]);

  // Order counts
  const [totalOrders, pendingOrders, paidOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { paymentStatus: 'PENDING' },
    }),
    prisma.order.count({
      where: { paymentStatus: 'PAID' },
    }),
  ]);

  // Queue metrics
  const [waiting, active, completed, failed] = await Promise.all([
    messageQueue.getWaitingCount(),
    messageQueue.getActiveCount(),
    messageQueue.getCompletedCount(),
    messageQueue.getFailedCount(),
  ]);

  return {
    messages: {
      inbound: inboundCount,
      outbound: outboundCount,
      processed: processedCount,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      paid: paidOrders,
    },
    queues: {
      messageProcessing: {
        waiting,
        active,
        completed,
        failed,
      },
    },
    database: {
      connections: 0, // Would need connection pool metrics
    },
    redis: {
      connected: !!getRedis(),
    },
  };
}

function getRedis() {
  try {
    const { getRedis: getRedisClient } = require('../config/redis');
    return getRedisClient();
  } catch {
    return null;
  }
}

// Prometheus format metrics
export async function getPrometheusMetrics(): Promise<string> {
  const metrics = await getSystemMetrics();

  const lines: string[] = [
    '# HELP zyra_messages_inbound_total Total inbound messages',
    '# TYPE zyra_messages_inbound_total counter',
    `zyra_messages_inbound_total ${metrics.messages.inbound}`,
    '',
    '# HELP zyra_messages_outbound_total Total outbound messages',
    '# TYPE zyra_messages_outbound_total counter',
    `zyra_messages_outbound_total ${metrics.messages.outbound}`,
    '',
    '# HELP zyra_orders_total Total orders',
    '# TYPE zyra_orders_total gauge',
    `zyra_orders_total ${metrics.orders.total}`,
    '',
    '# HELP zyra_orders_pending Total pending orders',
    '# TYPE zyra_orders_pending gauge',
    `zyra_orders_pending ${metrics.orders.pending}`,
    '',
    '# HELP zyra_queue_waiting Waiting jobs in queue',
    '# TYPE zyra_queue_waiting gauge',
    `zyra_queue_waiting ${metrics.queues.messageProcessing.waiting}`,
    '',
    '# HELP zyra_queue_active Active jobs in queue',
    '# TYPE zyra_queue_active gauge',
    `zyra_queue_active ${metrics.queues.messageProcessing.active}`,
    '',
    '# HELP zyra_queue_failed Failed jobs in queue',
    '# TYPE zyra_queue_failed gauge',
    `zyra_queue_failed ${metrics.queues.messageProcessing.failed}`,
  ];

  return lines.join('\n');
}

