# Zyra Platform Deployment Guide

This guide covers deploying the complete Zyra platform with all its components: frontend, backend, database, and AI services.

## 🚀 Quick Deployment

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis (for caching and queues)

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd Zyra

# Copy environment files
cp backend/env.example backend/.env
cp zyra-frontend/env.example zyra-frontend/.env.local

# Update environment variables
nano backend/.env
nano zyra-frontend/.env.local
```

### 2. Required Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=zyra_db
DB_USER=zyra_user
DB_PASSWORD=zyra_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis
REDIS_URL=redis://redis:6379

# Security
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Database Setup

```bash
# Run migrations
docker-compose exec backend npm run setup-db

# Seed initial data (optional)
docker-compose exec backend npm run seed
```

### 5. Verify Deployment

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs
- Grafana: http://localhost:3001 (admin/admin)

## 🏗️ Production Deployment

### 1. Cloud Infrastructure

#### Option A: AWS
```bash
# Using AWS ECS with Fargate
aws ecs create-cluster --cluster-name zyra-cluster
aws ecs create-service --cluster zyra-cluster --service-name zyra-backend
```

#### Option B: Google Cloud Platform
```bash
# Using Google Cloud Run
gcloud run deploy zyra-backend --source ./backend
gcloud run deploy zyra-frontend --source ./zyra-frontend
```

#### Option C: DigitalOcean
```bash
# Using DigitalOcean App Platform
doctl apps create --spec .do/app.yaml
```

### 2. Database Setup

#### PostgreSQL (Managed)
- **AWS RDS**: Create PostgreSQL instance
- **Google Cloud SQL**: Create Cloud SQL instance
- **DigitalOcean**: Create managed database

#### Redis (Managed)
- **AWS ElastiCache**: Create Redis cluster
- **Google Cloud Memorystore**: Create Redis instance
- **DigitalOcean**: Create managed Redis

### 3. Environment Configuration

#### Production Environment Variables
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
REDIS_URL=your-redis-url
OPENAI_API_KEY=your-openai-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

### 4. SSL/TLS Configuration

```bash
# Generate SSL certificates
certbot certonly --standalone -d your-domain.com

# Update nginx configuration
# Uncomment HTTPS server block in nginx.conf
```

### 5. Monitoring and Logging

#### Prometheus + Grafana
```bash
# Access monitoring
http://your-domain.com:9090  # Prometheus
http://your-domain.com:3001  # Grafana
```

#### Log Management
```bash
# Using ELK Stack
docker-compose -f docker-compose.logging.yml up -d
```

## 🔧 Scaling Configuration

### 1. Horizontal Scaling

#### Load Balancer Configuration
```yaml
# nginx.conf - Multiple backend instances
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

#### Auto-scaling
```yaml
# docker-compose.override.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 2. Database Scaling

#### Read Replicas
```sql
-- Configure read replicas in PostgreSQL
-- Update connection strings for read operations
```

#### Connection Pooling
```javascript
// backend/src/config/database.js
const poolConfig = {
  min: 10,
  max: 100,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
};
```

### 3. Caching Strategy

#### Redis Configuration
```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

#### Application Caching
```javascript
// Implement caching layers
const cache = require('redis');
const client = cache.createClient(process.env.REDIS_URL);
```

## 🚨 Security Configuration

### 1. Network Security

#### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 80
ufw allow 443
ufw allow 22
ufw deny 3000
ufw deny 3001
```

#### VPN Access
```bash
# Set up VPN for database access
# Configure private networks
```

### 2. Application Security

#### Rate Limiting
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

#### Input Validation
```javascript
// Validate all inputs
const { body, validationResult } = require('express-validator');
```

### 3. Data Security

#### Encryption
```javascript
// Encrypt sensitive data
const crypto = require('crypto');

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
```

#### Backup Strategy
```bash
# Automated backups
pg_dump zyra_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📊 Monitoring and Alerting

### 1. Health Checks

#### Application Health
```javascript
// backend/src/healthcheck.js
const healthCheck = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  database: await checkDatabase(),
  redis: await checkRedis()
};
```

#### Infrastructure Health
```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 2. Metrics Collection

#### Prometheus Metrics
```javascript
// Custom metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});
```

### 3. Alerting

#### Alert Rules
```yaml
# prometheus-alerts.yml
groups:
  - name: zyra-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

### 2. Automated Testing

```bash
# Run tests before deployment
npm test
npm run test:integration
npm run test:e2e
```

### 3. Blue-Green Deployment

```bash
# Deploy new version
docker-compose -f docker-compose.blue.yml up -d

# Switch traffic
nginx -s reload

# Remove old version
docker-compose -f docker-compose.green.yml down
```

## 📈 Performance Optimization

### 1. Database Optimization

#### Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
```

#### Query Optimization
```javascript
// Use efficient queries
const users = await db('users')
  .select('id', 'email', 'first_name')
  .where({ is_active: true })
  .limit(100);
```

### 2. Caching Strategy

#### Redis Caching
```javascript
// Cache frequently accessed data
const cacheKey = `user:${userId}:profile`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const user = await db('users').where({ id: userId }).first();
await redis.setex(cacheKey, 3600, JSON.stringify(user));
```

### 3. CDN Configuration

#### Static Assets
```javascript
// Serve static assets through CDN
app.use('/static', express.static('public', {
  maxAge: '1y',
  etag: true
}));
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend npm run db:test

# Reset database
docker-compose exec postgres psql -U zyra_user -d zyra_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### 2. Redis Connection Issues
```bash
# Test Redis connection
docker-compose exec backend node -e "const redis = require('redis'); const client = redis.createClient('redis://redis:6379'); client.ping().then(console.log);"
```

#### 3. AI Service Issues
```bash
# Test OpenAI connection
docker-compose exec backend node -e "const { OpenAI } = require('openai'); const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); openai.models.list().then(console.log);"
```

### Performance Issues

#### 1. High Memory Usage
```bash
# Monitor memory usage
docker stats

# Optimize Node.js memory
node --max-old-space-size=4096 server.js
```

#### 2. Slow Database Queries
```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### Log Analysis

#### 1. Application Logs
```bash
# View application logs
docker-compose logs -f backend | grep ERROR

# Filter specific errors
docker-compose logs backend | grep "Database connection failed"
```

#### 2. System Logs
```bash
# View system logs
journalctl -u docker -f
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🆘 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Check service health endpoints
5. Review the troubleshooting section

---

**Happy Deploying! 🚀**
