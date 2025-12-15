#!/bin/bash
set -e

cd /home/frank/Documents/Vs\ Code/Zyra

echo "🧹 Clearing ports..."
fuser -k 3000/tcp 3001/tcp 5432/tcp 6379/tcp 2>/dev/null || true
pkill -f "node.*3000|node.*3001|tsx|next" 2>/dev/null || true
sleep 2

echo "🐳 Starting Docker services..."
cd infra
docker compose up -d postgres redis
cd ..
sleep 5

echo "📦 Generating Prisma client..."
cd backend
if [ ! -f .env ]; then
  cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://zyra_user:zyra_password@localhost:5432/zyra_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=zyra_jwt_secret_key_minimum_32_characters_long_for_security
CORS_ORIGIN=http://localhost:3000
WA_PROVIDER=mock
LLM_PROVIDER=none
WA_WEBHOOK_VERIFY_TOKEN=changeme
STK_SIMULATION_MODE=true
EOF
  echo "✅ Created .env file"
fi

npm run prisma:generate
cd ..

echo "🔨 Building application..."
npm run build

echo "🚀 Starting development servers..."
npm run dev

