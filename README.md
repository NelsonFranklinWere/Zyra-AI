# Zyra - WhatsApp Sales Automation Platform

AI-powered WhatsApp Sales Automation Platform built with modern technologies.

## 🏗️ Architecture

This is a monorepo containing:

- `/apps/backend` - Fastify TypeScript API server
- `/apps/frontend` - Next.js 14 React application
- `/infra` - Docker Compose configuration
- `/packages` - Shared utilities (future)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd zyra
```

2. Copy environment variables:
```bash
cp infra/.env.example infra/.env
# Edit infra/.env with your configuration
```

3. Start all services:
```bash
cd infra
docker compose up --build
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

### Manual Setup

1. Install dependencies:
```bash
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

2. Set up environment variables:
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env

# Frontend
# Create apps/frontend/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Set up database:
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
```

4. Start development servers:
```bash
# From root
npm run dev

# Or separately:
npm run dev:backend
npm run dev:frontend
```

## 📁 Project Structure

```
zyra/
├── apps/
│   ├── backend/          # Fastify TypeScript API
│   │   ├── src/
│   │   │   ├── app.ts    # Fastify app setup
│   │   │   ├── server.ts # Server entry point
│   │   │   ├── env.ts    # Environment validation
│   │   │   ├── routes/   # API routes
│   │   │   ├── middleware/ # Auth & other middleware
│   │   │   └── ...
│   │   └── prisma/       # Prisma schema & migrations
│   └── frontend/         # Next.js 14 app
│       ├── src/
│       │   ├── app/      # Next.js app router pages
│       │   ├── components/ # React components
│       │   └── lib/      # Utilities & API client
│       └── ...
├── infra/                # Docker & infrastructure
│   ├── docker-compose.yml
│   └── init.sql
└── packages/             # Shared packages (future)
```

## 📦 Additional Resources

### Documentation
- **Operations Runbook**: `OPERATIONS.md` - Emergency procedures and routine maintenance
- **Admin Quick Start**: `ADMIN_QUICK_START.md` - Guide for business owners
- **Runbooks**: `RUNBOOKS.md` - Incident response procedures
- **Validation Checklist**: `VALIDATION_CHECKLIST.md` - Testing and verification steps
- **Sprint 2 Completion**: `SPRINT2_COMPLETION_SUMMARY.md` - Feature summary

### Postman Collection
Import `apps/backend/Zyra-Sprint2-Final.postman_collection.json` into Postman for complete API testing.

### Scripts
- **Database Backup**: `infra/scripts/backup.sh` - Automated DB backups
- **Burst Simulation**: `scripts/simulate-burst.ts` - Load testing

### Provider Setup

**Meta WhatsApp**:
1. Create Meta App at https://developers.facebook.com
2. Configure WhatsApp Business API
3. Get access token and phone number ID
4. Set env vars: `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `META_BUSINESS_ACCOUNT_ID`
5. Configure webhook URL in Meta dashboard

**360dialog**:
1. Sign up at https://www.360dialog.com
2. Get API key
3. Set env vars: `DIALOG360_API_KEY`, `DIALOG360_API_URL`

**MPESA Daraja**:
1. Register at https://developer.safaricom.co.ke
2. Create app and get credentials
3. Set env vars: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`
4. Configure callback URL: `https://your-domain.com/api/webhooks/mpesa`

## 🔐 Authentication

The app uses JWT tokens stored in httpOnly cookies.

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Get current user: `GET /api/auth/me` (protected)
- Logout: `POST /api/auth/logout`

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp mock webhook

### Health
- `GET /health` - Health check

## 🧪 Development

### Backend
```bash
cd apps/backend
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run lint         # Run ESLint
npm run prisma:studio # Open Prisma Studio
```

### Frontend
```bash
cd apps/frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 🐳 Docker

### Start all services
```bash
cd infra
docker compose up --build
```

### Stop all services
```bash
cd infra
docker compose down
```

### View logs
```bash
docker compose logs -f [service-name]
```

## 🗄️ Database

### Prisma Migrations
```bash
cd apps/backend
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open database GUI
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zyra_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧰 Tech Stack

### Backend
- **Fastify** - Fast web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Caching (future)
- **JWT** - Authentication
- **Zod** - Schema validation

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **ShadCN UI** - Component library
- **React Hook Form** - Form handling
- **Zod** - Validation

## 📄 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

