# Zyra Runbooks - Incident Response & Operations

## 🚨 Emergency Procedures

### STK Payment Failures

**Symptoms**: Customers report STK push not received or payments failing

**Steps**:
1. Check payment attempt status:
   ```sql
   SELECT pa.*, o.id as order_id 
   FROM payment_attempts pa
   JOIN orders o ON o.id = pa.order_id
   WHERE pa.status = 'FAILED' 
   AND pa.created_at > NOW() - INTERVAL '1 hour';
   ```

2. Check MPESA provider status:
   ```bash
   curl http://localhost:3001/system/metrics
   # Look for payment failure rate
   ```

3. Reconcile recent payments:
   ```bash
   curl -X GET "http://localhost:3001/api/admin/payments/reconcile?since=$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)" \
     -H "Authorization: Bearer <token>"
   ```

4. If provider issue, pause automation for affected orgs:
   ```bash
   curl -X PUT "http://localhost:3001/api/admin/organizations/<org-id>/automation" \
     -H "Authorization: Bearer <token>" \
     -d '{"enabled": false}'
   ```

---

### Provider Webhook Outages

**Symptoms**: No messages being received, webhook queue backing up

**Steps**:
1. Check webhook queue health:
   ```bash
   curl http://localhost:3001/system/metrics | grep queue
   ```

2. Verify webhook endpoint:
   ```bash
   curl "http://localhost:3001/api/webhooks/whatsapp/verify?hub.mode=subscribe&hub.challenge=test&hub.verify_token=changeme"
   ```

3. Check provider status (Meta/360dialog dashboard)

4. Review DLQ for failed webhook processing:
   - Go to Admin > DLQ
   - Check for webhook-related failures
   - Reprocess if safe

5. If prolonged outage, switch provider:
   ```bash
   # Update WA_PROVIDER env and restart
   export WA_PROVIDER=mock  # or 360dialog
   docker compose restart backend
   ```

---

### Reconciliation Mismatches

**Symptoms**: Payments marked as pending but customer paid

**Steps**:
1. Run reconciliation:
   ```bash
   GET /api/admin/payments/reconcile?since=<timestamp>
   ```

2. Review unmatched payments in admin UI

3. For each unmatched:
   - Check MPESA transaction status manually
   - If confirmed paid, mark manually:
     ```bash
     POST /api/admin/payments/:attemptId/manual-success
     {
       "providerRef": "MPESA_RECEIPT_NUMBER",
       "notes": "Manually verified"
     }
     ```

4. If systematic mismatch, check:
   - MPESA callback URL configuration
   - Network connectivity to callback endpoint
   - Provider webhook delivery logs

---

### Queue Backlog

**Symptoms**: High `zyra_queue_waiting` metric, slow message processing

**Steps**:
1. Check queue metrics:
   ```bash
   curl http://localhost:3001/metrics | grep zyra_queue_waiting
   ```

2. Scale workers (if using Docker Compose):
   ```yaml
   # docker-compose.override.yml
   services:
     worker:
       deploy:
         replicas: 10
   ```

3. Check for stuck jobs:
   - Review DLQ for patterns
   - Check Redis for long-running jobs

4. If persistent, pause non-critical orgs:
   ```bash
   # Pause automation for specific org
   PUT /api/admin/organizations/:id/automation
   {"enabled": false}
   ```

---

## 📋 Routine Maintenance

### Daily Checks

1. **Review DLQ**:
   - Check for new failed jobs
   - Reprocess or investigate failures

2. **Payment Reconciliation**:
   - Run reconciliation for last 24 hours
   - Verify all successful payments marked correctly

3. **LLM Usage**:
   - Check orgs approaching daily limits
   - Monitor costs

### Weekly Checks

1. **Database Maintenance**:
   ```bash
   # Backup
   ./infra/scripts/backup.sh
   
   # Check database size
   psql -d zyra_db -c "SELECT pg_size_pretty(pg_database_size('zyra_db'));"
   ```

2. **Review Audit Logs**:
   - Check for suspicious activities
   - Review template approvals
   - Verify payment operations

3. **Cleanup Old Data**:
   ```sql
   -- Remove old processing traces (>30 days)
   DELETE FROM processing_traces 
   WHERE created_at < NOW() - INTERVAL '30 days';
   
   -- Remove old DLQ items (>90 days)
   DELETE FROM dead_letter_jobs 
   WHERE status = 'discarded' 
   AND created_at < NOW() - INTERVAL '90 days';
   ```

---

## 🔧 Common Operations

### Pause Organization Automation

```bash
PUT /api/admin/organizations/:orgId/automation
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "enabled": false
}
```

### Manually Mark Payment Success

```bash
POST /api/admin/payments/:attemptId/manual-success
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "providerRef": "MPESA_RECEIPT_NUMBER",
  "notes": "Verified via bank statement"
}
```

### Reprocess DLQ Item

```bash
POST /api/admin/dlq/:id/reprocess
Authorization: Bearer <admin-token>
```

### Approve Template

```bash
POST /api/admin/moderation/templates/:id/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "action": "approve",
  "notes": "Approved for use"
}
```

### Claim Escalated Conversation

```bash
POST /api/admin/moderation/conversations/:id/claim
Authorization: Bearer <staff-token>
```

---

## 📊 Monitoring Alerts (Recommended)

Set up alerts for:

1. **High Queue Length**: `zyra_queue_waiting > 100`
2. **Payment Failure Rate**: `payment_failures / payment_attempts > 0.05` (5%)
3. **DLQ Growth**: `dead_letter_jobs count > 50`
4. **LLM Budget Exceeded**: Alert org owners at 80% usage
5. **Database Connections**: Alert if connection pool exhausted
6. **Webhook Failures**: Alert on 5xx responses from webhooks

---

## 🆘 Escalation Contacts

- **Technical Issues**: Check logs in `/var/log/zyra/`
- **Provider Issues**: Contact Meta/360dialog support
- **Payment Issues**: Verify MPESA Daraja credentials and callback URL
- **Database Issues**: Check Prisma connection pool and Redis connectivity

---

## 🔄 Deployment Checklist

Before deploying to production:

- [ ] Database migrations tested in staging
- [ ] Backup taken before migration
- [ ] Health checks passing
- [ ] Queue workers scaled appropriately
- [ ] Environment variables verified
- [ ] Provider credentials valid
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

See `OPERATIONS.md` for more detailed operational procedures.

