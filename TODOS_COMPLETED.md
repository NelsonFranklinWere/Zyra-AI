# ✅ Todos Completed

## Sprint 2 Completion - All Remaining Todos

### 1. ✅ RBAC Improvements

**Granular Permissions System**
- Added `permissions` JSONB field to User model
- Created `permissions.ts` middleware with:
  - `getUserPermissions()` - Get effective permissions (role defaults + custom overrides)
  - `hasPermission()` - Check specific permission
  - `requirePermission()` - Middleware factory for permission checks
  - `requireAnyPermission()` - Middleware for multiple permissions (OR logic)
- Default permissions per role:
  - OWNER: Full access
  - ADMIN: Most access except user/org settings
  - STAFF: Limited access (no approvals, settings, payments)

**Email Invite Flow**
- Created `invite.service.ts` with:
  - `createInvite()` - Create invitation for new team member
  - `acceptInvite()` - Accept invite and set password
  - `resendInvite()` - Resend invitation (new token)
  - `cancelInvite()` - Cancel/revoke invitation
- Added invite fields to User model:
  - `invitedAt`, `invitedBy`, `inviteToken`, `inviteExpiresAt`
  - `passwordHash` made optional (for invited users)
- Created `/api/org/invites` routes:
  - POST `/invites` - Create invite
  - POST `/invites/resend` - Resend invite
  - POST `/invites/cancel` - Cancel invite
- Added POST `/api/auth/accept-invite` public endpoint

**Refresh Token Rotation**
- Enhanced `RefreshToken` model with:
  - `familyId` - Token family for rotation tracking
  - `previousToken` - Previous token in rotation chain
  - `revoked`, `revokedAt`, `revokedReason` - Revocation tracking
- Updated `refreshToken.ts` service with:
  - `rotateRefreshToken()` - Rotate token (invalidate old, create new)
  - `revokeRefreshToken()` - Revoke single token
  - `revokeAllUserTokens()` - Revoke all user tokens (logout all devices)
  - `cleanupExpiredTokens()` - Cleanup job
- Updated `/api/auth/refresh` endpoint to use rotation
- Added `/api/auth/revoke-all` endpoint for logout all devices

**Files Created/Modified:**
- `apps/backend/prisma/schema.prisma` - Updated User and RefreshToken models
- `apps/backend/src/services/invite.service.ts` - New invite service
- `apps/backend/src/services/refreshToken.ts` - Enhanced with rotation
- `apps/backend/src/middleware/permissions.ts` - New permissions middleware
- `apps/backend/src/routes/organizations.invites.ts` - New invite routes
- `apps/backend/src/routes/auth.ts` - Updated with rotation and accept-invite

---

### 2. ✅ Test Suite Expansion

**New Test Files Created:**
- `apps/backend/src/__tests__/invite.test.ts`
  - Tests for invite creation, acceptance, resend, cancel
  - Error cases (expired, invalid token, already exists)
  
- `apps/backend/src/__tests__/permissions.test.ts`
  - Tests for permission system
  - Role-based default permissions
  - Custom permission overrides
  - Permission checks

- `apps/backend/src/__tests__/refreshToken.rotation.test.ts`
  - Tests for token rotation
  - Token family management
  - Revocation logic
  - Verification with rotation

**Existing Test Files:**
- `auth.test.ts` - Authentication tests
- `auth.integration.test.ts` - Integration tests
- `intent.test.ts` - Intent detection tests
- `products.test.ts` - Product tests
- `rule-engine.test.ts` - Rule engine tests
- `webhook.test.ts` - Webhook tests

**Test Configuration:**
- Jest configured with TypeScript support
- Coverage collection configured
- Module path mapping for monorepo

---

### 3. ✅ Kubernetes Manifests

**Created Kubernetes Deployment Files:**

1. **Namespace** (`infra/k8s/namespace.yaml`)
   - Zyra namespace definition

2. **Backend Deployment** (`infra/k8s/backend-deployment.yaml`)
   - Deployment with 3 replicas
   - Service (ClusterIP)
   - HorizontalPodAutoscaler (3-10 replicas based on CPU/memory)
   - Health probes (liveness, readiness)
   - Resource limits/requests
   - Environment variables from secrets

3. **PostgreSQL StatefulSet** (`infra/k8s/postgres-statefulset.yaml`)
   - StatefulSet for PostgreSQL 15
   - PersistentVolumeClaim (20Gi)
   - Service (headless)
   - Health probes
   - Resource limits

4. **Redis Deployment** (`infra/k8s/redis-deployment.yaml`)
   - Deployment for Redis 7
   - PersistentVolumeClaim (5Gi)
   - AOF persistence enabled
   - Service (ClusterIP)
   - Health probes

5. **Secrets Template** (`infra/k8s/secrets.example.yaml`)
   - Example secret configuration
   - All required environment variables

6. **Kubernetes README** (`infra/k8s/README.md`)
   - Deployment instructions
   - Scaling guide
   - Monitoring instructions
   - Troubleshooting guide
   - Rolling update procedures

**Features:**
- Production-ready manifests
- Health checks and probes
- Resource limits and requests
- Horizontal scaling (HPA)
- Persistent storage for DB and Redis
- Secrets management
- Service discovery

---

## Summary

All three remaining todos have been completed:

1. ✅ **RBAC Improvements** - Granular permissions, email invites, refresh token rotation
2. ✅ **Test Suite Expansion** - New tests for invites, permissions, token rotation
3. ✅ **Kubernetes Manifests** - Complete K8s deployment configuration

**Next Steps:**
1. Run migrations: `npx prisma migrate dev --name add_rbac_improvements`
2. Run tests: `npm test`
3. Deploy to Kubernetes: Follow `infra/k8s/README.md`

**All Sprint 2 todos are now complete!** ✅

