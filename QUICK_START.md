# Quick Start - Fix "Site Can't Be Reached"

## Issue
The site can't be reached because:
1. Database (PostgreSQL) not running
2. Environment variables not set
3. Servers not started properly

## Quick Fix

### Step 1: Start Database & Redis
```bash
cd infra
docker compose up -d postgres redis
```

### Step 2: Create .env file (if missing)
```bash
cd backend
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://zyra_user:zyra_password@localhost:5432/zyra_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=http://localhost:3000
WA_PROVIDER=mock
LLM_PROVIDER=none
EOF
```

### Step 3: Generate Prisma Client & Run Migrations
```bash
cd backend
npm run prisma:generate
npx prisma migrate dev  # Or use existing SQL migrations
```

### Step 4: Start Servers
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Step 5: Verify
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000

## Troubleshooting

**If still not working:**
1. Check Docker: `docker ps` (should see postgres and redis)
2. Check ports: `lsof -i :3000,3001` (should show Node processes)
3. Check logs: Look at terminal output for errors
4. Check .env: Ensure DATABASE_URL and JWT_SECRET are set

