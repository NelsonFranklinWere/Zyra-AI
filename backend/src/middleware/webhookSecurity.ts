import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { env } from '../env';
import { getWhatsAppProvider } from '../providers/whatsapp';

export interface WebhookSecurityConfig {
  verifySignature: boolean;
  timestampTolerance: number; // seconds
  replayProtection: boolean;
}

const defaultConfig: WebhookSecurityConfig = {
  verifySignature: true,
  timestampTolerance: 60, // 60 seconds
  replayProtection: true,
};

// Store seen message IDs to prevent replay attacks
const seenMessageIds = new Map<string, number>();
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function cleanOldMessageIds() {
  const now = Date.now();
  for (const [id, timestamp] of seenMessageIds.entries()) {
    if (now - timestamp > REPLAY_WINDOW_MS) {
      seenMessageIds.delete(id);
    }
  }
}

// Clean every 10 minutes
setInterval(cleanOldMessageIds, 10 * 60 * 1000);

export async function verifyWebhookSignature(
  request: FastifyRequest,
  config: WebhookSecurityConfig = defaultConfig
): Promise<boolean> {
  const provider = getWhatsAppProvider();
  const providerName = provider.name();

  // Mock provider doesn't need signature verification
  if (providerName === 'mock') {
    return true;
  }

  // Meta WhatsApp signature verification
  if (providerName === 'meta') {
    return verifyMetaSignature(request, config);
  }

  // Twilio signature verification
  if (providerName === 'twilio') {
    return verifyTwilioSignature(request, config);
  }

  // Default: check for X-Hub-Signature-256 header
  const signature = request.headers['x-hub-signature-256'] as string;
  if (!signature) {
    return !config.verifySignature; // If verification disabled, allow
  }

  const rawBody = (request as any).rawBody || JSON.stringify(request.body);
  const secret = env.WA_WEBHOOK_VERIFY_TOKEN || '';

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}

function verifyMetaSignature(
  request: FastifyRequest,
  config: WebhookSecurityConfig
): boolean {
  const signature = request.headers['x-hub-signature-256'] as string;
  if (!signature && !config.verifySignature) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const rawBody = (request as any).rawBody || JSON.stringify(request.body);
  const appSecret = env.WA_API_KEY || env.WA_WEBHOOK_VERIFY_TOKEN || '';

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}

function verifyTwilioSignature(
  request: FastifyRequest,
  config: WebhookSecurityConfig
): boolean {
  const signature = request.headers['x-twilio-signature'] as string;
  if (!signature && !config.verifySignature) {
    return true;
  }

  if (!signature) {
    return false;
  }

  // Twilio signature verification requires the raw request URL
  const url = request.url;
  const params = request.body as Record<string, string>;
  const authToken = env.WA_API_KEY || '';

  // Build signature string
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');

  const signatureString = url + sortedParams;
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(signatureString)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function checkReplayProtection(
  messageId: string,
  timestamp: number
): Promise<{ isReplay: boolean; error?: string }> {
  // Check if message ID was seen recently
  if (seenMessageIds.has(messageId)) {
    return { isReplay: true, error: 'Duplicate message ID detected' };
  }

  // Check timestamp freshness
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;

  if (age > 300) {
    // Older than 5 minutes
    return { isReplay: true, error: 'Message timestamp too old' };
  }

  // Record this message ID
  seenMessageIds.set(messageId, Date.now());

  return { isReplay: false };
}

export function webhookSecurity(config: WebhookSecurityConfig = defaultConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verify signature
      if (config.verifySignature) {
        const isValid = await verifyWebhookSignature(request, config);
        if (!isValid) {
          return reply.code(401).send({
            success: false,
            message: 'Invalid webhook signature',
          });
        }
      }

      // Replay protection
      if (config.replayProtection) {
        const body = request.body as any;
        const messageId = body.id || body.messageId || body.message?.id;
        const timestamp = body.timestamp || body.message?.timestamp || Math.floor(Date.now() / 1000);

        if (messageId) {
          const replayCheck = await checkReplayProtection(messageId, timestamp);
          if (replayCheck.isReplay) {
            return reply.code(409).send({
              success: false,
              message: replayCheck.error || 'Duplicate request',
            });
          }
        }
      }
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Webhook security check failed',
        error: error.message,
      });
    }
  };
}

