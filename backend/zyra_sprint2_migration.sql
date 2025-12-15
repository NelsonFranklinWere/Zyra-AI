-- Prisma Migration SQL for Zyra Sprint 2 Core Entities
-- This is a simplified migration focusing on essential Sprint 2 tables
-- Matches the actual Zyra schema structure (org_id, UUID TEXT ids)

-- Rules Table (Conversation Rules for Automation)
CREATE TABLE IF NOT EXISTS conversation_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversation_rules_org_id_key_unique UNIQUE (org_id, key)
);

CREATE INDEX IF NOT EXISTS idx_conversation_rules_org_id ON conversation_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_conversation_rules_org_id_enabled ON conversation_rules(org_id, enabled);

-- Templates Table (Message Templates)
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    tone TEXT DEFAULT 'friendly',
    status TEXT NOT NULL DEFAULT 'draft',
    is_whatsapp_template BOOLEAN NOT NULL DEFAULT false,
    provider_template_id TEXT,
    sensitive BOOLEAN NOT NULL DEFAULT false,
    approved_by TEXT,
    approved_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT templates_org_id_name_unique UNIQUE (org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_templates_org_id ON templates(org_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL,
    total_cents INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    delivery_status TEXT NOT NULL DEFAULT 'PENDING',
    metadata JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_conversation_id ON orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Payment Attempts Table
CREATE TABLE IF NOT EXISTS payment_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    provider TEXT NOT NULL DEFAULT 'mpesa',
    status TEXT NOT NULL DEFAULT 'INITIATED',
    provider_ref TEXT,
    external_ref TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    callback_payload JSONB,
    metadata JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order_id ON payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_external_ref ON payment_attempts(external_ref);

-- Processing Traces Table
CREATE TABLE IF NOT EXISTS processing_traces (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    message_id TEXT NOT NULL,
    step TEXT NOT NULL,
    input JSONB,
    output JSONB,
    duration_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    error TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_processing_traces_message_id ON processing_traces(message_id);
CREATE INDEX IF NOT EXISTS idx_processing_traces_created_at ON processing_traces(created_at);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

