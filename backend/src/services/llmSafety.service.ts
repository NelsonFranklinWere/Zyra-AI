import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface LLMOutputCheck {
  allowed: boolean;
  violations: string[];
}

/**
 * Sanitize LLM output to prevent sending disallowed content
 */
export function sanitizeLLMOutput(output: string, allowedVariables?: Record<string, string>): LLMOutputCheck {
  const violations: string[] = [];
  const allowedValues = allowedVariables ? Object.values(allowedVariables).join('|') : '';

  // Check for URLs not in allowed variables
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = output.match(urlPattern) || [];
  for (const url of urls) {
    if (!allowedValues.includes(url)) {
      violations.push(`Disallowed URL found: ${url}`);
    }
  }

  // Check for phone numbers not in allowed variables
  const phonePattern = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phones = output.match(phonePattern) || [];
  for (const phone of phones) {
    if (!allowedValues.includes(phone)) {
      violations.push(`Disallowed phone number found: ${phone}`);
    }
  }

  // Check for bank account patterns
  const accountPattern = /\b\d{10,}\b/g; // 10+ digit numbers
  const accounts = output.match(accountPattern) || [];
  for (const account of accounts) {
    if (!allowedValues.includes(account)) {
      violations.push(`Potential account number found: ${account}`);
    }
  }

  // Check for email addresses not in allowed variables
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = output.match(emailPattern) || [];
  for (const email of emails) {
    if (!allowedValues.includes(email)) {
      violations.push(`Disallowed email found: ${email}`);
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
  };
}

/**
 * Log LLM usage with prompt hash (privacy-safe)
 */
export async function logLLMUsage(params: {
  orgId: string;
  userId?: string;
  prompt: string;
  response: string;
  provider: string;
  tokensUsed?: number;
  costCents?: number;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const promptHash = crypto.createHash('sha256').update(params.prompt).digest('hex');
    
    // Truncate prompt/response for logging (keep first 500 chars)
    const truncatedPrompt = params.prompt.substring(0, 500);
    const truncatedResponse = params.response.substring(0, 500);

    await prisma.aiUsage.create({
      data: {
        orgId: params.orgId,
        provider: params.provider,
        promptHash,
        promptLength: params.prompt.length,
        tokensUsed: params.tokensUsed || Math.ceil((params.prompt.length + params.response.length) / 4),
        costCents: params.costCents,
        metadata: {
          ...params.metadata,
          truncatedPrompt,
          truncatedResponse,
          userId: params.userId,
        },
      },
    });
  } catch (error) {
    console.error('Failed to log LLM usage:', error);
    // Don't throw - logging should not break main flow
  }
}

/**
 * Check if org has LLM kill switch enabled
 */
export async function isLLMDisabled(orgId: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { automationEnabled: true },
  });

  // LLM disabled if automation disabled
  return !org?.automationEnabled;
}

