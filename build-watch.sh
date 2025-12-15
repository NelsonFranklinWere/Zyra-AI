#!/bin/bash
set -e

cd /home/frank/Documents/Vs\ Code/Zyra

echo "🔍 Building and watching for issues..."
echo "=========================================="
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
cd backend
npm run prisma:generate 2>&1 | tee ../build-errors.log
cd ..

echo ""
echo "🔨 Step 2: Building Backend..."
cd backend
npm run build 2>&1 | tee -a ../build-errors.log || {
  echo "❌ Backend build failed!"
  echo "Errors:"
  grep -E "error|Error|ERROR" ../build-errors.log | head -20
  exit 1
}
cd ..

echo ""
echo "🎨 Step 3: Building Frontend..."
cd frontend
npm run build 2>&1 | tee -a ../build-errors.log || {
  echo "❌ Frontend build failed!"
  echo "Errors:"
  grep -E "error|Error|ERROR" ../build-errors.log | tail -20
  exit 1
}
cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Checking for warnings..."
grep -i "warning" build-errors.log | head -10 || echo "No warnings found"

