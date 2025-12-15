-- Sprint 2: Core Features Migration
-- Run with: npx prisma migrate dev --name sprint2_core_features

-- Create templates table
CREATE TABLE IF NOT EXISTS "templates" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "tone" TEXT DEFAULT 'friendly',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_whatsapp_template" BOOLEAN NOT NULL DEFAULT false,
    "provider_template_id" TEXT,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "customer_phone" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "payment_status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Create payment_attempts table
CREATE TABLE IF NOT EXISTS "payment_attempts" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mpesa',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "provider_ref" TEXT,
    "external_ref" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "callback_payload" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- Create settlements table
CREATE TABLE IF NOT EXISTS "settlements" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "fee_cents" INTEGER NOT NULL DEFAULT 0,
    "net_amount_cents" INTEGER NOT NULL,
    "provider_ref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "settlement_date" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS "refunds" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_attempt_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider_ref" TEXT,
    "callback_payload" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS "financial_transactions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "order_id" TEXT,
    "type" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "fee_cents" INTEGER NOT NULL DEFAULT 0,
    "net_amount_cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider_ref" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- Create outgoing_messages table
CREATE TABLE IF NOT EXISTS "outgoing_messages" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "conversation_id" TEXT,
    "to" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "template" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider_ref" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    CONSTRAINT "outgoing_messages_pkey" PRIMARY KEY ("id")
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS "analytics_events" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- Create processing_traces table
CREATE TABLE IF NOT EXISTS "processing_traces" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "duration_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "processing_traces_pkey" PRIMARY KEY ("id")
);

-- Create stock_reservations table
CREATE TABLE IF NOT EXISTS "stock_reservations" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "order_id" TEXT,
    "conversation_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'held',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- Create dead_letter_jobs table
CREATE TABLE IF NOT EXISTS "dead_letter_jobs" (
    "id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "job_id" TEXT,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "stack_trace" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "org_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reprocessed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dead_letter_jobs_pkey" PRIMARY KEY ("id")
);

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS "ai_usage" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT,
    "model" TEXT,
    "prompt_hash" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "cost_cents" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS "rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "window_ms" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "reset_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- Create opt_outs table
CREATE TABLE IF NOT EXISTS "opt_outs" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opt_outs_pkey" PRIMARY KEY ("id")
);

-- Create group_scans table
CREATE TABLE IF NOT EXISTS "group_scans" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,
    "consented_by" TEXT,
    "consent_date" TIMESTAMP(3),
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "group_scans_pkey" PRIMARY KEY ("id")
);

-- Create mpesa_callbacks table
CREATE TABLE IF NOT EXISTS "mpesa_callbacks" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "event_type" TEXT NOT NULL,
    "provider_ref" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mpesa_callbacks_pkey" PRIMARY KEY ("id")
);

-- Create idempotency_keys table
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
    "key" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("key")
);

-- Create distributed_locks table
CREATE TABLE IF NOT EXISTS "distributed_locks" (
    "key" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "distributed_locks_pkey" PRIMARY KEY ("key")
);

-- Create organization_invites table
CREATE TABLE IF NOT EXISTS "organization_invites" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_by" TEXT,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organization_invites_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "templates_org_id_name_key" ON "templates"("org_id", "name");
CREATE INDEX IF NOT EXISTS "templates_org_id_idx" ON "templates"("org_id");
CREATE INDEX IF NOT EXISTS "templates_status_idx" ON "templates"("status");

CREATE INDEX IF NOT EXISTS "orders_org_id_idx" ON "orders"("org_id");
CREATE INDEX IF NOT EXISTS "orders_conversation_id_idx" ON "orders"("conversation_id");
CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders"("payment_status");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");

CREATE INDEX IF NOT EXISTS "payment_attempts_order_id_idx" ON "payment_attempts"("order_id");
CREATE INDEX IF NOT EXISTS "payment_attempts_status_idx" ON "payment_attempts"("status");
CREATE INDEX IF NOT EXISTS "payment_attempts_external_ref_idx" ON "payment_attempts"("external_ref");

CREATE INDEX IF NOT EXISTS "settlements_org_id_idx" ON "settlements"("org_id");
CREATE INDEX IF NOT EXISTS "settlements_status_idx" ON "settlements"("status");
CREATE INDEX IF NOT EXISTS "settlements_settlement_date_idx" ON "settlements"("settlement_date");

CREATE INDEX IF NOT EXISTS "refunds_order_id_idx" ON "refunds"("order_id");
CREATE INDEX IF NOT EXISTS "refunds_status_idx" ON "refunds"("status");

CREATE INDEX IF NOT EXISTS "financial_transactions_org_id_idx" ON "financial_transactions"("org_id");
CREATE INDEX IF NOT EXISTS "financial_transactions_order_id_idx" ON "financial_transactions"("order_id");
CREATE INDEX IF NOT EXISTS "financial_transactions_type_idx" ON "financial_transactions"("type");
CREATE INDEX IF NOT EXISTS "financial_transactions_created_at_idx" ON "financial_transactions"("created_at");

CREATE INDEX IF NOT EXISTS "outgoing_messages_org_id_idx" ON "outgoing_messages"("org_id");
CREATE INDEX IF NOT EXISTS "outgoing_messages_conversation_id_idx" ON "outgoing_messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "outgoing_messages_status_idx" ON "outgoing_messages"("status");
CREATE INDEX IF NOT EXISTS "outgoing_messages_created_at_idx" ON "outgoing_messages"("created_at");

CREATE INDEX IF NOT EXISTS "analytics_events_org_id_idx" ON "analytics_events"("org_id");
CREATE INDEX IF NOT EXISTS "analytics_events_event_type_idx" ON "analytics_events"("event_type");
CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events"("created_at");

CREATE INDEX IF NOT EXISTS "processing_traces_message_id_idx" ON "processing_traces"("message_id");
CREATE INDEX IF NOT EXISTS "processing_traces_created_at_idx" ON "processing_traces"("created_at");

CREATE INDEX IF NOT EXISTS "stock_reservations_product_id_status_idx" ON "stock_reservations"("product_id", "status");
CREATE INDEX IF NOT EXISTS "stock_reservations_expires_at_idx" ON "stock_reservations"("expires_at");
CREATE INDEX IF NOT EXISTS "stock_reservations_order_id_idx" ON "stock_reservations"("order_id");

CREATE INDEX IF NOT EXISTS "dead_letter_jobs_queue_name_status_idx" ON "dead_letter_jobs"("queue_name", "status");
CREATE INDEX IF NOT EXISTS "dead_letter_jobs_org_id_idx" ON "dead_letter_jobs"("org_id");
CREATE INDEX IF NOT EXISTS "dead_letter_jobs_created_at_idx" ON "dead_letter_jobs"("created_at");

CREATE INDEX IF NOT EXISTS "ai_usage_org_id_created_at_idx" ON "ai_usage"("org_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_user_id_idx" ON "ai_usage"("user_id");
CREATE INDEX IF NOT EXISTS "ai_usage_prompt_hash_idx" ON "ai_usage"("prompt_hash");

CREATE UNIQUE INDEX IF NOT EXISTS "rate_limits_key_key" ON "rate_limits"("key");
CREATE INDEX IF NOT EXISTS "rate_limits_reset_at_idx" ON "rate_limits"("reset_at");

CREATE UNIQUE INDEX IF NOT EXISTS "opt_outs_org_id_phone_number_key" ON "opt_outs"("org_id", "phone_number");
CREATE INDEX IF NOT EXISTS "opt_outs_org_id_idx" ON "opt_outs"("org_id");

CREATE UNIQUE INDEX IF NOT EXISTS "group_scans_org_id_group_id_key" ON "group_scans"("org_id", "group_id");
CREATE INDEX IF NOT EXISTS "group_scans_org_id_idx" ON "group_scans"("org_id");

CREATE INDEX IF NOT EXISTS "mpesa_callbacks_event_type_idx" ON "mpesa_callbacks"("event_type");
CREATE INDEX IF NOT EXISTS "mpesa_callbacks_provider_ref_idx" ON "mpesa_callbacks"("provider_ref");
CREATE INDEX IF NOT EXISTS "mpesa_callbacks_processed_idx" ON "mpesa_callbacks"("processed");
CREATE INDEX IF NOT EXISTS "mpesa_callbacks_created_at_idx" ON "mpesa_callbacks"("created_at");

CREATE INDEX IF NOT EXISTS "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

CREATE INDEX IF NOT EXISTS "distributed_locks_expires_at_idx" ON "distributed_locks"("expires_at");

CREATE UNIQUE INDEX IF NOT EXISTS "organization_invites_token_key" ON "organization_invites"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "organization_invites_org_id_email_key" ON "organization_invites"("org_id", "email");
CREATE INDEX IF NOT EXISTS "organization_invites_token_idx" ON "organization_invites"("token");
CREATE INDEX IF NOT EXISTS "organization_invites_org_id_idx" ON "organization_invites"("org_id");

-- Add foreign keys
ALTER TABLE "templates" ADD CONSTRAINT "templates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

