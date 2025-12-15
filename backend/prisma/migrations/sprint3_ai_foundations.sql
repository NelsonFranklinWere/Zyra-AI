-- Sprint 3: AI Automation Foundations Migration
-- Run with: npx prisma migrate dev --name sprint3_ai_foundations

-- Create BusinessMemory table
CREATE TABLE IF NOT EXISTS "business_memory" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "faqs" JSONB,
    "instructions" JSONB,
    "negotiation_rules" JSONB,
    "delivery_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_memory_pkey" PRIMARY KEY ("id")
);

-- Create AIProcessingTrace table
CREATE TABLE IF NOT EXISTS "ai_processing_traces" (
    "id" TEXT NOT NULL,
    "message_id" TEXT,
    "org_id" TEXT,
    "conversation_id" TEXT,
    "trace_type" TEXT NOT NULL,
    "payload" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_processing_traces_pkey" PRIMARY KEY ("id")
);

-- Create AISessionMemory table
CREATE TABLE IF NOT EXISTS "ai_session_memory" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "session_key" TEXT NOT NULL,
    "memory" JSONB NOT NULL,
    "ttl_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_session_memory_pkey" PRIMARY KEY ("id")
);

-- Update AIUsage table (add userId, model fields if not exists)
-- Note: Check if columns exist first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage' AND column_name='user_id') THEN
        ALTER TABLE "ai_usage" ADD COLUMN "user_id" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage' AND column_name='model') THEN
        ALTER TABLE "ai_usage" ADD COLUMN "model" TEXT;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "business_memory_org_id_key" ON "business_memory"("org_id");
CREATE INDEX IF NOT EXISTS "ai_processing_traces_message_id_idx" ON "ai_processing_traces"("message_id");
CREATE INDEX IF NOT EXISTS "ai_processing_traces_org_id_idx" ON "ai_processing_traces"("org_id");
CREATE INDEX IF NOT EXISTS "ai_processing_traces_conversation_id_idx" ON "ai_processing_traces"("conversation_id");
CREATE INDEX IF NOT EXISTS "ai_processing_traces_trace_type_idx" ON "ai_processing_traces"("trace_type");
CREATE INDEX IF NOT EXISTS "ai_processing_traces_created_at_idx" ON "ai_processing_traces"("created_at");
CREATE INDEX IF NOT EXISTS "ai_session_memory_org_id_idx" ON "ai_session_memory"("org_id");
CREATE INDEX IF NOT EXISTS "ai_session_memory_session_key_idx" ON "ai_session_memory"("session_key");
CREATE INDEX IF NOT EXISTS "ai_session_memory_created_at_idx" ON "ai_session_memory"("created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_user_id_idx" ON "ai_usage"("user_id");
CREATE INDEX IF NOT EXISTS "ai_usage_prompt_hash_idx" ON "ai_usage"("prompt_hash");

-- Add foreign keys
ALTER TABLE "business_memory" ADD CONSTRAINT "business_memory_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_session_memory" ADD CONSTRAINT "ai_session_memory_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on business_memory.org_id
CREATE UNIQUE INDEX IF NOT EXISTS "business_memory_org_id_unique" ON "business_memory"("org_id");

