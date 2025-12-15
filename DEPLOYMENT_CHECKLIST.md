# Sprint 2 Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `WA_PROVIDER` set (meta, 360dialog, or mock)
- [ ] `WA_API_KEY` / `META_ACCESS_TOKEN` / `DIALOG360_API_KEY` configured
- [ ] `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` set
- [ ] `LLM_PROVIDER` configured (openai, anthropic, local, or none)
- [ ] `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` if using LLM
- [ ] `REDIS_URL` configured
- [ ] `DATABASE_URL` configured
- [ ] `JWT_SECRET` set (minimum 32 characters)
- [ ] `BASE_URL` set for webhook callbacks

### Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed initial data: `npm run db:seed`
- [ ] Backup database before deployment
- [ ] Verify all new tables exist (check Prisma Studio or SQL)

### Services
- [ ] Docker Compose services healthy
- [ ] PostgreSQL accessible
- [ ] Redis accessible
- [ ] Backend health check passing: `curl http://localhost:3001/health`
- [ ] Frontend builds successfully

### Provider Setup

**Meta WhatsApp**:
- [ ] Meta App created
- [ ] Phone number verified
- [ ] Webhook URL configured in Meta dashboard
- [ ] Webhook verify token matches env var
- [ ] Test webhook verification

**MPESA**:
- [ ] Daraja app created (sandbox or production)
- [ ] Callback URL configured: `{BASE_URL}/api/webhooks/mpesa`
- [ ] Test STK push in sandbox

## Deployment Steps

1. **Stop existing services**:
   ```bash
   docker compose -f infra/docker-compose.yml down
   ```

2. **Pull latest code**

3. **Update environment variables**

4. **Run migrations**:
   ```bash
   docker compose -f infra/docker-compose.yml exec backend npx prisma migrate deploy
   ```

5. **Start services**:
   ```bash
   docker compose -f infra/docker-compose.yml up --build -d
   ```

6. **Verify health**:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/metrics
   ```

7. **Test critical paths**:
   - Send test message via simulate endpoint
   - Verify processing works
   - Check monitoring dashboard

## Post-Deployment

- [ ] Monitor queue metrics (should be low initially)
- [ ] Check DLQ for immediate failures
- [ ] Verify webhook endpoints accessible from providers
- [ ] Test payment flow (if MPESA configured)
- [ ] Review audit logs for errors

## Rollback Plan

If issues occur:

1. **Stop new deployment**:
   ```bash
   docker compose -f infra/docker-compose.yml down
   ```

2. **Restore previous version**:
   ```bash
   git checkout <previous-commit>
   ```

3. **Restore database** (if migrations caused issues):
   ```bash
   psql -d zyra_db < backup.sql
   ```

4. **Restart services**:
   ```bash
   docker compose -f infra/docker-compose.yml up --build -d
   ```

## Monitoring Checklist

First 24 hours:
- [ ] Queue length stable (< 100)
- [ ] No DLQ items appearing
- [ ] Payment success rate > 95%
- [ ] No 5xx errors in logs
- [ ] Provider webhooks delivering successfully

