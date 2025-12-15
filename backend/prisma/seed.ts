import { seedSprint2 } from './seeds/sprint2.seed';
import { seedAI } from '../src/seed/seed-ai';

async function main() {
  await seedSprint2();
  await seedAI();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });

