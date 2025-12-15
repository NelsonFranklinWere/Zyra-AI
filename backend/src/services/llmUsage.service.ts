import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface LLMUsageRecord {
  orgId: string;
  provider: string;
  promptHash: string;
  promptLength: number;
  tokensUsed: number;
  costCents?: number;
  metadata?: Record<string, any>;
}

export async function recordLLMUsage(record: LLMUsageRecord): Promise<void> {
  try {
    await prisma.aiUsage.create({
      data: {
        orgId: record.orgId,
        provider: record.provider,
        promptHash: record.promptHash,
        promptLength: record.promptLength,
        tokensUsed: record.tokensUsed,
        costCents: record.costCents,
        metadata: record.metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to record LLM usage:', error);
    // Don't throw - usage tracking should not break main flow
  }
}

export function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

export async function getOrgLLMUsage(
  orgId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalCalls: number;
  totalTokens: number;
  totalCostCents: number;
  dailyUsage: Array<{ date: string; calls: number; tokens: number }>;
}> {
  const where: any = { orgId };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const usage = await prisma.aiUsage.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  const totalCalls = usage.length;
  const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0);
  const totalCostCents = usage.reduce((sum, u) => sum + (u.costCents || 0), 0);

  // Group by date
  const dailyUsageMap = new Map<string, { calls: number; tokens: number }>();
  for (const record of usage) {
    const date = record.createdAt.toISOString().split('T')[0];
    const existing = dailyUsageMap.get(date) || { calls: 0, tokens: 0 };
    dailyUsageMap.set(date, {
      calls: existing.calls + 1,
      tokens: existing.tokens + record.tokensUsed,
    });
  }

  const dailyUsage = Array.from(dailyUsageMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));

  return {
    totalCalls,
    totalTokens,
    totalCostCents,
    dailyUsage,
  };
}

export async function checkOrgLLMBudget(orgId: string): Promise<{
  allowed: boolean;
  remaining: number;
  reason?: string;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org || !org.llmBudgetDaily) {
    return { allowed: true, remaining: Infinity };
  }

  // Get today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayUsage = await prisma.aiUsage.count({
    where: {
      orgId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const remaining = Math.max(0, org.llmBudgetDaily - todayUsage);

  return {
    allowed: remaining > 0,
    remaining,
    reason: remaining === 0 ? 'Daily LLM budget exceeded' : undefined,
  };
}

