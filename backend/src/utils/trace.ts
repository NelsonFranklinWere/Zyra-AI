import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createProcessingTrace(
  messageId: string,
  step: string,
  data: { input?: any; output?: any; error?: string; duration?: number; [key: string]: any }
): Promise<void> {
  try {
    await prisma.processingTrace.create({
      data: {
        messageId,
        step,
        input: data.input,
        output: data.output,
        success: !data.error,
        error: data.error,
        durationMs: data.duration,
        metadata: data,
      },
    });
  } catch (error) {
    console.error('Failed to create processing trace:', error);
    // Don't throw - tracing should not break main flow
  }
}

