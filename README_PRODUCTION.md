# Zyra Production Hardening Guide

This document covers production-ready features implemented to harden Sprint 2.

## ✅ Implemented Features

### 1. Webhook Security
- ✅ HMAC signature verification (Meta, Twilio)
- ✅ Timestamp freshness checks (60s TTL)
- ✅ Replay protection (message ID tracking)
- ✅ Zod payload validation

### 2. Idempotency & Concurrency Safety
- ✅ Idempotency keys for webhooks (`X-Idempotency-Key` header)
- ✅ Distributed locking (Redis + DB fallback) for:
  - Order creation
  - Stock reservation
  - Payment STK triggers
- ✅ Prevents duplicate orders and double-STK triggers

### 3. Stock & Inventory Management
- ✅ Atomic stock reservations with expiration (15 min hold)
- ✅ Stock reservation worker (auto-releases expired holds)
- ✅ Reserved stock tracking (`reservedStock` field)
- ✅ Stock confirmed only on payment success

### 4. Rate Limiting & Anti-Abuse
- ✅ Per-organization rate limits (messages, LLM, STK)
- ✅ Per-phone number rate limits
- ✅ Opt-out keyword detection (STOP, UNSUBSCRIBE)
- ✅ Opt-out state tracking

### 5. LLM Controls & Cost Safeguards
- ✅ Per-org daily LLM budget tracking
- ✅ LLM usage logging (`ai_usage` table)
- ✅ Fail-open when budget exceeded (uses rule-based fallback)
- ✅ Prompt hashing for deduplication

### 6. Payment Hardening
- ✅ KYC guardrails (org must be `verified` for payments)
- ✅ Idempotent STK triggers (prevents duplicate)
- ✅ Payment attempt lifecycle tracking
- ✅ Stock confirmation on payment success

### 7. Dead Letter Queue (DLQ)
- ✅ Automatic DLQ for failed jobs after retries
- ✅ DLQ admin UI (view, reprocess, discard)
- ✅ Conversation auto-escalation on DLQ

### 8. Monitoring & Observability
- ✅ Prometheus `/metrics` endpoint
- ✅ System health endpoint (`/health`)
- ✅ JSON metrics endpoint (`/system/metrics`)
- ✅ Queue metrics (waiting, active, failed)
- ✅ Message/order counters

### 9. Admin Tools
- ✅ Monitoring dashboard (system metrics, queue status)
- ✅ DLQ management UI
- ✅ Org automation pause/resume
- ✅ Conversation escalation

## 🚀 Running Production Setup

### 1. Environment Variables

Ensure all required env vars are set:

```bash
# Critical for production
NODE_ENV=production
JWT_SECRET=<strong-secret-min-32-chars>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# WhatsApp Provider
WA_PROVIDER=meta  # or mock for testing
WA_WEBHOOK_VERIFY_TOKEN=<secure-token>
WA_API_KEY=<provider-api-key>

# LLM (optional)
LLM_PROVIDER=openai
OPENAI_API_KEY=<key>
# Per-org budgets set in DB

# Payment (when ready)
MPESA_ENV=production
MPESA_CONSUMER_KEY=<key>
MPESA_CONSUMER_SECRET=<secret>
```

### 2. Database Migrations

```bash
cd apps/backend
npx prisma migrate deploy  # Production
# or
npx prisma migrate dev --name production_hardening  # Dev
```

### 3. Seed Production Data

```bash
npm run db:seed
```

### 4. Start Services

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Metrics (Prometheus)
```bash
curl http://localhost:3001/metrics
```

### System Metrics (JSON)
```bash
curl http://localhost:3001/system/metrics
```

## 🔒 Security Checklist

- [x] Webhook signature verification enabled
- [x] Replay protection active
- [x] Rate limiting on webhooks
- [x] Idempotency for critical operations
- [x] Distributed locking for race conditions
- [x] KYC checks before payments
- [x] Opt-out compliance

## 🧪 Testing

### Simulate Burst
```bash
cd apps/backend
tsx scripts/simulate-burst.ts --count=200 --delay=10
```

### Test Idempotency
Send same webhook twice with same `id` field - should only process once.

### Test Stock Locking
Send multiple orders for same product simultaneously - should prevent overselling.

## 📚 Operations

See `OPERATIONS.md` for emergency procedures:
- Pause organization automation
- Handle DLQ items
- Payment reconciliation
- Stock release procedures

## ⚠️ Known Limitations

1. **Multi-WA Numbers**: Single number per org (Sprint 3 feature)
2. **Provider Integrations**: Meta scaffold complete, needs real credentials
3. **KYC Processing**: Status flag only, actual KYC out of scope
4. **Billing Engine**: Metering exists, billing logic TBD
5. **Encryption**: Field-level encryption placeholder (use Vault/AWS KMS in prod)

## 🔄 Next Steps (Sprint 3)

- Multi-WA number support
- Real-time WebSocket updates
- Template approval workflow
- Advanced analytics dashboard
- Full KYC integration
- Billing engine

