# Zyra - AI-Powered Automation Platform

Zyra is a comprehensive, multi-tenant SaaS platform that provides AI-powered automation, data analysis, and intelligent insights for businesses. Built with modern technologies and designed for scalability, security, and compliance.

## 🚀 Features

### Core Capabilities
- **AI-Powered Email Automation** - Intelligent email workflows with triggers, conditions, and actions
- **Advanced AI Analysis** - Content analysis, sentiment detection, and actionable insights
- **Multi-Database Sync** - Seamless data synchronization across different database systems
- **Automated Reporting** - Scheduled reports with PDF/CSV generation and distribution
- **Social Media Integration** - Automated posting and engagement across platforms
- **Payment Processing** - MPesa, Stripe, and bank integration for financial automation
- **CV & Content Generation** - AI-powered CV creation and social media content generation
- **Data Import/Export** - CSV/Excel import with schema mapping and validation

### Technical Features
- **Multi-tenant Architecture** - Secure tenant isolation with role-based access control
- **Real-time Processing** - WebSocket connections for live updates and notifications
- **Background Workers** - Queue-based processing for heavy operations
- **API-First Design** - Comprehensive REST API with OpenAPI documentation
- **Security & Compliance** - GDPR, CCPA, and cybercrime law compliance
- **Monitoring & Analytics** - Built-in monitoring with Prometheus and Grafana

## 🏗️ Architecture

### Backend Stack
- **Node.js + Express** - High-performance API server
- **PostgreSQL** - Primary database with JSONB support
- **Redis** - Caching and message queuing
- **Prisma** - Type-safe database ORM
- **BullMQ** - Background job processing
- **OpenAI/Anthropic** - AI model integration

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### Infrastructure
- **Docker** - Containerized deployment
- **Nginx** - Reverse proxy and load balancing
- **Prometheus + Grafana** - Monitoring and observability
- **N8N** - Workflow automation (optional)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zyra/zyra-platform.git
   cd zyra-platform
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../zyra-frontend
   npm install
   ```

3. **Database setup**
   ```bash
   # Create database
   createdb zyra_db
   
   # Run migrations
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Environment configuration**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../zyra-frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd zyra-frontend
   npm run dev
   
   # Terminal 3 - Worker (optional)
   cd backend
   npm run worker
   ```

### Docker Deployment

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the services**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - N8N (optional): http://localhost:5678
   - Grafana: http://localhost:3001 (admin/admin123)

## 📚 API Documentation

### Authentication
All API endpoints require authentication via JWT tokens:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/automations/email
```

### Key Endpoints

#### Email Automation
```bash
# Create automation
curl -X POST http://localhost:3001/api/automations/email \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Series",
    "triggers": {"type": "user_signup"},
    "conditions": {"user_segment": "premium"},
    "actions": {"type": "send_email", "template": "welcome"}
  }'

# Trigger automation
curl -X POST http://localhost:3001/api/automations/email/ID/trigger \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerPayload": {"manual": true}}'
```

#### AI Analysis
```bash
# Analyze content
curl -X POST http://localhost:3001/api/ai/analyze \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "email",
    "sourceId": "email_123",
    "options": {"model": "gpt-4"}
  }'

# Generate CV
curl -X POST http://localhost:3001/api/ai/generate/cv \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {"firstName": "John", "lastName": "Doe"},
    "experience": [{"company": "Tech Corp", "position": "Developer"}],
    "template": "modern"
  }'
```

#### Integrations
```bash
# Request verification
curl -X POST http://localhost:3001/api/integrations/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "facebook_page",
    "identifier": "page_123",
    "method": "email"
  }'

# Confirm verification
curl -X POST http://localhost:3001/api/integrations/verify/confirm \
  -H "Content-Type: application/json" \
  -d '{"token": "verification_token"}'
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://zyra_user:password@localhost:5432/zyra_db"
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payments
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
MPESA_CONSUMER_KEY="your-mpesa-consumer-key"

# Security
JWT_SECRET="your-super-secret-jwt-key"
WEBHOOK_SIGNATURE_SECRET="your-webhook-secret"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable"
```

## 🧪 Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd backend
npm run test:integration
```

### E2E Tests
```bash
cd zyra-frontend
npm run test:e2e
```

## 📊 Monitoring & Observability

### Health Checks
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000/api/health

### Metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin123)

### Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# Docker logs
docker-compose logs -f backend
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="postgresql://user:pass@prod-db:5432/zyra_db"
   export REDIS_URL="redis://prod-redis:6379"
   ```

2. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Build and Deploy**
   ```bash
   # Backend
   cd backend
   npm run build
   npm start
   
   # Frontend
   cd zyra-frontend
   npm run build
   npm start
   ```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting and DDoS protection
- Webhook signature verification
- Data encryption at rest and in transit
- GDPR and CCPA compliance

### Security Checklist
- [ ] Change default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup encryption
- [ ] Review access permissions

## 📈 Performance

### Optimization Tips
- Enable Redis caching for frequently accessed data
- Use database connection pooling
- Implement CDN for static assets
- Monitor and optimize database queries
- Use background workers for heavy operations

### Scaling
- Horizontal scaling with load balancers
- Database read replicas
- Redis clustering for high availability
- Microservices architecture for large deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.zyra.com](https://docs.zyra.com)
- Support: support@zyra.com
- Community: [Discord](https://discord.gg/zyra)
- Issues: [GitHub Issues](https://github.com/zyra/zyra-platform/issues)

## 🗺️ Roadmap

### Q1 2024
- [ ] Advanced AI model integration
- [ ] Mobile app development
- [ ] Enhanced analytics dashboard
- [ ] Multi-language support

### Q2 2024
- [ ] Enterprise SSO integration
- [ ] Advanced workflow builder
- [ ] Real-time collaboration features
- [ ] API rate limiting improvements

### Q3 2024
- [ ] Machine learning model training
- [ ] Advanced security features
- [ ] Performance optimizations
- [ ] Third-party marketplace

---

**Built with ❤️ by the Zyra Team**