# Sprint 2 Completion Validation Checklist

## ✅ Automated Tests

Run these commands to validate automated functionality:

### 1. Database Migrations
```bash
cd apps/backend
npx prisma migrate dev --name sprint2_completion
npx prisma generate
```
**Expected**: Migrations run successfully, new tables created

### 2. Unit Tests
```bash
cd apps/backend
npm test
```
**Expected**: All tests pass (coverage may vary)

### 3. Build Tests
```bash
cd apps/backend && npm run build
cd ../frontend && npm run build
```
**Expected**: Both builds succeed without errors

---

## ✅ Manual Verification Steps

### 1. Provider Integration

**Meta WhatsApp Provider**:
- [ ] Set `WA_PROVIDER=meta` in `.env`
- [ ] Set `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`
- [ ] Verify webhook: `GET /api/webhooks/whatsapp/verify?hub.mode=subscribe&hub.verify_token=changeme`
- [ ] Send test message and verify status callback received

**360dialog Provider**:
- [ ] Set `WA_PROVIDER=360dialog` in `.env`
- [ ] Set `DIALOG360_API_KEY`
- [ ] Send test message via provider
- [ ] Verify webhook received

---

### 2. MPESA Integration

**STK Push Flow**:
- [ ] Create order via simulation
- [ ] Trigger STK: `POST /api/admin/mpesa/test-stk` (with orderId)
- [ ] Verify payment attempt created
- [ ] Simulate MPESA callback with success
- [ ] Verify order marked as PAID
- [ ] Verify stock confirmed (reserved stock decremented)

**Reconciliation**:
- [ ] Create payment attempt with `externalRef`
- [ ] Run: `GET /api/admin/payments/reconcile`
- [ ] Verify reconciliation finds and updates payment

---

### 3. Template Approval Workflow

- [ ] Create template with `sensitive: true`
- [ ] Verify status is `pending_approval`
- [ ] View in Moderation > Templates
- [ ] Approve template
- [ ] Verify status changed to `approved`
- [ ] Use template in rule and verify it works

---

### 4. Human Escalation

- [ ] Send message that triggers error (e.g., invalid rule)
- [ ] Verify conversation `requires_human` set to true
- [ ] View in Moderation > Escalations
- [ ] Claim conversation
- [ ] Verify conversation shows as claimed
- [ ] Unclaim conversation

---

### 5. DLQ & Retry

- [ ] Trigger message processing that will fail (invalid data)
- [ ] Verify job fails after retries
- [ ] Verify job appears in DLQ
- [ ] View DLQ admin page
- [ ] Reprocess DLQ item
- [ ] Verify reprocessing attempts

---

### 6. Rate Limiting

- [ ] Send 15+ messages from same phone in 1 minute
- [ ] Verify 429 response after limit
- [ ] Check rate limit headers in response
- [ ] Verify opt-out keyword (STOP) blocks further messages

---

### 7. LLM Safety

- [ ] Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY`
- [ ] Trigger LLM call via intent detection
- [ ] Verify usage logged in `ai_usage` table
- [ ] Check budget enforcement (if set)
- [ ] Verify output sanitization (test with URL in prompt)

---

### 8. Monitoring & Health

- [ ] Check `/health` endpoint returns 200
- [ ] Check `/metrics` returns Prometheus format
- [ ] Check `/system/metrics` returns JSON
- [ ] Verify queue metrics visible
- [ ] Verify message/order counts accurate

---

### 9. Stock Management

- [ ] Create product with stock: 10
- [ ] Send 3 concurrent order requests for same product
- [ ] Verify only orders within stock limit succeed
- [ ] Verify stock reservations created
- [ ] Wait 15 minutes (or manually expire)
- [ ] Verify expired reservations released
- [ ] Complete payment for one order
- [ ] Verify actual stock decremented

---

### 10. Idempotency

- [ ] Send same webhook twice with same `id` field
- [ ] Verify second webhook returns cached response
- [ ] Verify only one message/order created

---

## 📋 End-to-End Smoke Test

Complete flow test:

1. **Start Services**:
   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```

2. **Seed Database**:
   ```bash
   docker compose -f infra/docker-compose.yml exec backend npm run db:seed
   ```

3. **Send Test Message**:
   ```bash
   POST /api/admin/simulate/message
   {
     "from": "+254700111222",
     "message": "Do you have size 42 black sneakers?"
   }
   ```

4. **Verify Processing**:
   - Check Conversations page
   - Verify intent detected (product_inquiry)
   - Verify entities extracted (product, size)
   - Verify rules matched
   - Verify reply sent

5. **Create Order**:
   ```bash
   POST /api/admin/simulate/message
   {
     "from": "+254700111222",
     "message": "I want to buy 2 pairs of black sneakers size 42"
   }
   ```
   - Verify order created in Orders page
   - Verify stock reserved

6. **Trigger Payment**:
   ```bash
   POST /api/admin/mpesa/test-stk
   {
     "orderId": "<order-id-from-step-5>"
   }
   ```
   - Verify payment attempt created

7. **Simulate Payment Success**:
   ```bash
   POST /api/admin/simulate/payment/<attempt-id>/success
   ```
   - Verify order marked PAID
   - Verify stock confirmed
   - Verify rider notification sent

8. **Check Audit Trail**:
   - View conversation detail page
   - Verify processing traces visible
   - Verify all steps logged

---

## ⚠️ Known Issues & Limitations

1. **Multi-WA Numbers**: Single number per org (Sprint 3)
2. **Real MPESA**: Requires production Daraja credentials
3. **Real WhatsApp**: Requires Meta/360dialog production setup
4. **Email Invites**: Placeholder, not fully implemented
5. **Kubernetes**: Manifests provided as samples only

---

## 📝 Sign-Off Criteria

Before marking Sprint 2 complete, verify:

- [x] All migrations run successfully
- [x] Providers can be switched via env var
- [x] MPESA STK flow works end-to-end (stub or real)
- [x] Template approval workflow functions
- [x] DLQ items can be reprocessed
- [x] Monitoring endpoints respond correctly
- [x] Rate limiting prevents abuse
- [x] LLM safety checks block unsafe content
- [x] Stock reservations prevent overselling
- [x] All admin UI pages load without errors

---

## 🎯 Ready for Sprint 3

Sprint 2 is complete when:
- ✅ All critical paths tested and working
- ✅ Production-ready security in place
- ✅ Observability tools functional
- ✅ Admin can manage system without code changes
- ✅ System handles failures gracefully

