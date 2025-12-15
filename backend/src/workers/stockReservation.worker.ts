import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../config/redis';

const prisma = new PrismaClient();

export async function startStockReservationWorker() {
  const redis = getRedis();
  if (!redis) {
    console.log('⚠️  Redis not available, stock reservation worker will not start');
    return;
  }

  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  };

  const worker = new Worker(
    'stock-reservation-expiry',
    async (job) => {
      await processExpiredReservations();
    },
    {
      connection,
      concurrency: 1,
    }
  );

  // Schedule periodic check for expired reservations
  setInterval(async () => {
    const expiredReservations = await prisma.stockReservation.findMany({
      where: {
        expiresAt: { lte: new Date() },
        status: 'held',
      },
      include: {
        product: true,
      },
    });

    for (const reservation of expiredReservations) {
      await releaseStockReservation(reservation.id);
    }
  }, 60 * 1000); // Check every minute

  console.log('✅ Stock reservation worker started');
}

async function processExpiredReservations() {
  const expiredReservations = await prisma.stockReservation.findMany({
    where: {
      expiresAt: { lte: new Date() },
      status: 'held',
    },
    include: {
      product: true,
    },
  });

  for (const reservation of expiredReservations) {
    await releaseStockReservation(reservation.id);
  }
}

async function releaseStockReservation(reservationId: string) {
  const reservation = await prisma.stockReservation.findUnique({
    where: { id: reservationId },
    include: { product: true },
  });

  if (!reservation || reservation.status !== 'held') {
    return;
  }

  // Release the reserved stock
  await prisma.$transaction([
    // Update product reserved stock
    prisma.product.update({
      where: { id: reservation.productId },
      data: {
        reservedStock: {
          decrement: reservation.quantity,
        },
      },
    }),
    // Mark reservation as released
    prisma.stockReservation.update({
      where: { id: reservationId },
      data: {
        status: 'released',
      },
    }),
  ]);

  console.log(`Released stock reservation ${reservationId} for product ${reservation.productId}`);
}

