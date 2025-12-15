import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  REDIS_LOCK_TTL: z.coerce.number().default(3000), // ms for distributed locks
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  
  // WhatsApp Provider
  WA_PROVIDER: z.enum(['mock', 'meta', '360dialog', 'twilio']).default('mock'),
  WA_API_KEY: z.string().optional(),
  WA_WEBHOOK_VERIFY_TOKEN: z.string().default('changeme'),
  
  // LLM Provider & AI Config
  LLM_PROVIDER: z.enum(['openai', 'anthropic', 'local', 'none']).default('none'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_DEFAULT_MODEL: z.string().default('gpt-4o-mini'),
  LLM_MAX_TOKENS: z.coerce.number().default(400),
  LLM_SAFE_MODE: z.coerce.boolean().default(true),
  
  // AI Tuning & Quotas
  AI_CALLS_PER_ORG_PER_DAY: z.coerce.number().default(1000),
  AI_MIN_CONFIDENCE: z.coerce.number().default(0.6),
  
  // Tracing & Observability
  TRACE_ENABLED: z.coerce.boolean().default(true),
  
  // Other
  STK_SIMULATION_MODE: z.coerce.boolean().default(true),
  
  // MPESA
  MPESA_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_CALLBACK_URL: z.string().url().optional(),
  
  // Meta WhatsApp (when using Meta provider)
  META_ACCESS_TOKEN: z.string().optional(),
  META_PHONE_NUMBER_ID: z.string().optional(),
  META_BUSINESS_ACCOUNT_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  
  // 360dialog (when using 360dialog provider)
  DIALOG360_API_KEY: z.string().optional(),
  DIALOG360_API_URL: z.string().url().optional(),
  
  // Worker settings
  BULL_RETRY_ATTEMPTS: z.coerce.number().default(3),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { env };
