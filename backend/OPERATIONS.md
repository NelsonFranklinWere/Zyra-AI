# Zyra Operations Runbook

Emergency procedures and operational guides for Zyra platform.

## Emergency Procedures

### 1. Pause Organization Automation

**When**: Need to stop all automated processing for an organization

**Steps**:
```sql
-- Via SQL
UPDATE organizations SET automation_enabled = false WHERE id = '<org_id>';

-- Via API (requires owner/admin auth)
PUT /api/admin/organizations/:id
{
  "automationEnabled": false
}
```

**Verify**: Check `/api/admin/organizations/:id` - `automationEnabled` should be `false`

---

### 2. Handle Dead Letter Queue (DLQ)

**When**: Jobs repeatedly failing after retries

**View DLQ Items**:
```bash
GET /api/admin/dlq
```

**Reprocess a DLQ Item**:
```bash
POST /api/admin/dlq/:id/reprocess
```

**Discard a DLQ Item** (if not recoverable):
```bash
DELETE /api/admin/dlq/:id
{
  "reason": "Known issue, manually handled"
}
```

**Bulk Reprocess** (via script):
```typescript
// See scripts/reprocess-dlq.ts
```

---

### 3. Payment Reconciliation

**When**: Payment status unclear or needs manual verification

**Check Payment Status**:
```sql
SELECT o.id, o.payment_status, pa.status, pa.provider_ref, pa.created_at
FROM orders o
LEFT JOIN payment_attempts pa ON pa.order_id = o.id
WHERE o.id = '<order_id>';
```

**Manually Mark Payment Success**:
```bash
POST /api/admin/simulate/payment/:attemptId/success
```

**Or via SQL** (emergency only):
```sql
BEGIN;

UPDATE payment_attempts 
SET status = 'SUCCESS', provider_ref = 'manual_recon_<timestamp>'
WHERE id = '<attempt_id>';

UPDATE orders 
SET payment_status = 'PAID'
WHERE id = '<order_id>';

COMMIT;
```

---

### 4. Release Stock Reservations

**When**: Stock stuck in reserved state

**View Expired Reservations**:
```sql
SELECT sr.*, p.name 
FROM stock_reservations sr
JOIN products p ON p.id = sr.product_id
WHERE sr.status = 'held' 
AND sr.expires_at < NOW();
```

**Manually Release**:
```sql
BEGIN;

UPDATE products
SET reserved_stock = reserved_stock - sr.quantity
FROM stock_reservations sr
WHERE products.id = sr.product_id
AND sr.id = '<reservation_id>';

UPDATE stock_reservations
SET status = 'released'
WHERE id = '<reservation_id>';

COMMIT;
```

---

### 5. Queue Monitoring & Recovery

**Check Queue Health**:
```bash
GET /metrics
# Or
GET /system/metrics
```

**Pause Queue Processing** (emergency):
- Stop worker: `docker compose stop backend`
- Or reduce concurrency in worker config

**Clear Stuck Jobs**:
```sql
-- View stuck jobs in BullMQ (requires Redis access)
-- Use BullMQ dashboard or Redis CLI
```

---

### 6. LLM Budget Reset

**When**: Organization hit daily LLM limit

**Check Current Usage**:
```sql
SELECT COUNT(*) as calls, SUM(tokens_used) as tokens
FROM ai_usage
WHERE org_id = '<org_id>'
AND DATE(created_at) = CURRENT_DATE;
```

**Reset Budget** (temporary override):
```sql
UPDATE organizations
SET llm_budget_daily = 1000  -- Increase limit
WHERE id = '<org_id>';
```

---

### 7. Opt-Out Management

**List Opted-Out Users**:
```sql
SELECT * FROM opt_outs WHERE org_id = '<org_id>';
```

**Remove Opt-Out** (if requested):
```sql
DELETE FROM opt_outs 
WHERE org_id = '<org_id>' AND phone_number = '<phone>';
```

---

### 8. Database Backup & Restore

**Backup**:
```bash
pg_dump -h localhost -U zyra_user -d zyra_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore**:
```bash
psql -h localhost -U zyra_user -d zyra_db < backup_20241201_120000.sql
```

**Scheduled Backups** (cron):
```bash
0 2 * * * pg_dump -h localhost -U zyra_user -d zyra_db > /backups/zyra_$(date +\%Y\%m\%d).sql
```

---

## Monitoring & Alerts

### Key Metrics to Watch

1. **Queue Length**: `zyra_queue_waiting` (should stay < 100)
2. **Failed Jobs**: `zyra_queue_failed` (alert if > 10/hour)
3. **Payment Failures**: Monitor `payment_attempts` with `status = 'FAILED'`
4. **LLM Usage**: Track `ai_usage` table for budget overruns

### Health Checks

```bash
# Overall health
curl http://localhost:3001/health

# Metrics (Prometheus)
curl http://localhost:3001/metrics

# System metrics (JSON)
curl http://localhost:3001/system/metrics
```

---

## Scaling Considerations

### Horizontal Scaling (Workers)

Workers are stateless and can be scaled horizontally:

```yaml
# docker-compose.override.yml
services:
  worker:
    deploy:
      replicas: 5
    environment:
      - WORKER_CONCURRENCY=10
```

### Database Connection Pooling

Ensure Prisma connection pool is configured:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
```

---

## Deployment Checklist

1. ✅ Run database migrations: `npx prisma migrate deploy`
2. ✅ Verify environment variables
3. ✅ Check Redis connectivity
4. ✅ Verify health endpoint: `/health`
5. ✅ Monitor queue metrics after deployment
6. ✅ Check DLQ for any immediate failures

---

## Troubleshooting

### High Queue Length
- Increase worker concurrency
- Scale horizontally (add more worker instances)
- Check for slow database queries

### Payment Issues
- Verify KYC status: `SELECT kyc_status FROM organizations WHERE id = '<org_id>'`
- Check payment provider credentials
- Review payment attempt logs

### LLM Errors
- Check API key validity
- Verify budget limits
- Review `ai_usage` table for patterns

---

## Support Contacts

- **Technical Issues**: Check logs in `/var/log/zyra/`
- **Database Issues**: Review Prisma logs and connection pool
- **Provider Issues**: Check provider-specific error logs

