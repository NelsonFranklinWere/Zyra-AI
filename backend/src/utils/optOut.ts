import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'optout', 'quit', 'cancel'];

export function isOptOutMessage(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  return OPT_OUT_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export async function checkOptOut(orgId: string, phoneNumber: string): Promise<boolean> {
  const optOut = await prisma.optOut.findUnique({
    where: {
      orgId_phoneNumber: {
        orgId,
        phoneNumber,
      },
    },
  });

  return !!optOut;
}

export async function recordOptOut(
  orgId: string,
  phoneNumber: string,
  reason: string = 'stop'
): Promise<void> {
  await prisma.optOut.upsert({
    where: {
      orgId_phoneNumber: {
        orgId,
        phoneNumber,
      },
    },
    update: {
      reason,
    },
    create: {
      orgId,
      phoneNumber,
      reason,
    },
  });
}

