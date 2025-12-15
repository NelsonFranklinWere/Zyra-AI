import { randomBytes } from 'crypto';
import { env } from '../env';

/**
 * Generate a unique trace ID
 */
export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Get trace ID from context or generate new one
 */
export function getTraceId(traceId?: string): string {
  return traceId || generateTraceId();
}

/**
 * Create structured log metadata with trace ID
 */
export function createTraceMetadata(traceId: string, orgId?: string, additional?: Record<string, any>) {
  return {
    traceId,
    ...(orgId && { orgId }),
    ...(env.TRACE_ENABLED && additional),
  };
}

/**
 * Format trace for logging
 */
export function formatTrace(
  traceId: string,
  event: string,
  data?: Record<string, any>,
  orgId?: string
): string {
  const parts = [`[trace:${traceId}]`, event];
  if (orgId) parts.push(`[org:${orgId}]`);
  if (data) parts.push(JSON.stringify(data));
  return parts.join(' ');
}

