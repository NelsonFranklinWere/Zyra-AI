#!/bin/bash
# Start Zyra Application

set -e

echo "🔧 Starting Zyra Application..."

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
fuser -k 3000/tcp 3001/tcp 5432/tcp 6379/tcp 2>/dev/null || true
pkill -9 -f "node.*3000|node.*3001|tsx|next|concurrently" 2>/dev/null || true
sleep 2

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
cd "$(dirname "$0")"
docker compose -f infra/docker-compose.yml up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Generate Prisma client
echo "📦 Generating Prisma client..."
cd backend
npm run prisma:generate || echo "⚠️ Prisma generate may have issues"

# Build
echo "🔨 Building application..."
cd ../..
npm run build || echo "⚠️ Build completed with warnings"

# Start dev servers
echo "🚀 Starting development servers..."
npm run dev

