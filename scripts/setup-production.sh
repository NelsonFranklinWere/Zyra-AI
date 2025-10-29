#!/bin/bash

# Zyra Production Setup Script
# This script sets up the Zyra platform for production deployment

set -e

echo "🚀 Setting up Zyra for production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Prerequisites check passed"

# Create production environment files
print_status "Creating production environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend/.env from template..."
    cp backend/env.example backend/.env
    print_warning "Please update backend/.env with your production values"
else
    print_warning "backend/.env already exists, skipping creation"
fi

# Frontend .env.local
if [ ! -f "zyra-frontend/.env.local" ]; then
    print_status "Creating zyra-frontend/.env.local from template..."
    cp zyra-frontend/.env.local.example zyra-frontend/.env.local
    print_warning "Please update zyra-frontend/.env.local with your production values"
else
    print_warning "zyra-frontend/.env.local already exists, skipping creation"
fi

# Install dependencies
print_status "Installing dependencies..."

# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd zyra-frontend
npm ci --only=production
cd ..

# Build frontend
print_status "Building frontend for production..."
cd zyra-frontend
npm run build
cd ..

print_success "Dependencies installed and frontend built"

# Database setup
print_status "Setting up database..."

# Start PostgreSQL and Redis with Docker Compose
print_status "Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Run database migrations
print_status "Running database migrations..."
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..

print_success "Database setup completed"

# Build Docker images
print_status "Building Docker images..."
docker-compose build

print_success "Docker images built successfully"

# Create systemd service files (optional)
print_status "Creating systemd service files..."

# Backend service
sudo tee /etc/systemd/system/zyra-backend.service > /dev/null <<EOF
[Unit]
Description=Zyra Backend Service
After=network.target

[Service]
Type=simple
User=zyra
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/zyra-frontend.service > /dev/null <<EOF
[Unit]
Description=Zyra Frontend Service
After=network.target

[Service]
Type=simple
User=zyra
WorkingDirectory=$(pwd)/zyra-frontend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service files created"

# Create nginx configuration
print_status "Creating nginx configuration..."

sudo tee /etc/nginx/sites-available/zyra > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/zyra /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

print_success "Nginx configuration created"

# Create monitoring configuration
print_status "Setting up monitoring..."

# Create Prometheus configuration
mkdir -p monitoring
cat > monitoring/prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'zyra-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'zyra-frontend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF

print_success "Monitoring configuration created"

# Create backup script
print_status "Creating backup script..."

cat > scripts/backup.sh <<'EOF'
#!/bin/bash

# Zyra Backup Script
BACKUP_DIR="/opt/zyra/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U zyra_user -d zyra_db > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/application_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    /opt/zyra/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x scripts/backup.sh

print_success "Backup script created"

# Create deployment checklist
print_status "Creating deployment checklist..."

cat > DEPLOYMENT_CHECKLIST.md <<EOF
# Zyra Production Deployment Checklist

## Pre-deployment
- [ ] Update all environment variables in backend/.env
- [ ] Update all environment variables in zyra-frontend/.env.local
- [ ] Configure SSL certificates for HTTPS
- [ ] Set up domain name and DNS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy

## Environment Variables to Update
### Backend (.env)
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- OPENAI_API_KEY
- SMTP_HOST, SMTP_USER, SMTP_PASS
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
- STRIPE_SECRET_KEY
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

### Frontend (.env.local)
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

## Post-deployment
- [ ] Test all API endpoints
- [ ] Verify email functionality
- [ ] Test AI analysis features
- [ ] Verify payment processing
- [ ] Check monitoring dashboards
- [ ] Test backup and restore procedures
- [ ] Verify SSL certificate
- [ ] Test load balancing (if applicable)

## Security Checklist
- [ ] Change default passwords
- [ ] Enable firewall
- [ ] Configure SSL/TLS
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure backup encryption
- [ ] Review access permissions

## Monitoring Setup
- [ ] Prometheus metrics collection
- [ ] Grafana dashboards
- [ ] Log aggregation
- [ ] Alert configuration
- [ ] Health check endpoints

## Performance Optimization
- [ ] Enable Redis caching
- [ ] Configure CDN
- [ ] Optimize database queries
- [ ] Set up load balancing
- [ ] Configure auto-scaling
EOF

print_success "Deployment checklist created"

# Final instructions
print_success "Zyra production setup completed!"
echo ""
print_status "Next steps:"
echo "1. Update environment variables in backend/.env and zyra-frontend/.env.local"
echo "2. Configure your domain name and SSL certificates"
echo "3. Review the DEPLOYMENT_CHECKLIST.md file"
echo "4. Start the services:"
echo "   - sudo systemctl start zyra-backend"
echo "   - sudo systemctl start zyra-frontend"
echo "   - sudo systemctl enable zyra-backend zyra-frontend"
echo "5. Or use Docker Compose: docker-compose up -d"
echo ""
print_status "For monitoring, access:"
echo "- Grafana: http://your-domain:3001 (admin/admin123)"
echo "- Prometheus: http://your-domain:9090"
echo ""
print_warning "Remember to:"
echo "- Configure your domain name in nginx configuration"
echo "- Set up SSL certificates"
echo "- Update firewall rules"
echo "- Configure monitoring alerts"
echo ""
print_success "Setup complete! 🎉"
