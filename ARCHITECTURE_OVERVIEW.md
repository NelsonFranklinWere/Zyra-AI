# Zyra Platform - Complete Architecture Overview

## 🏗️ System Architecture

Zyra is a comprehensive AI-powered automation platform built with modern technologies and designed for scalability, security, and performance.

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Query
- **UI Components**: Custom components with Framer Motion
- **Authentication**: JWT + OAuth (Google)

#### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT + Passport.js
- **AI Integration**: OpenAI GPT-4

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Load Balancer**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Queue System**: BullMQ + Redis
- **File Storage**: Local + S3 (optional)

## 🧠 AI Core System

### Modular AI Architecture

The Zyra AI Core is designed as a modular system with specialized AI modules:

#### 1. CV Builder Module
```javascript
// Generates professional CVs with AI
const cvResult = await aiCoreService.generateCV(userData, preferences);
```

**Features:**
- Modern 2025 CV templates
- ATS optimization
- Skills matching
- Industry-specific formatting

#### 2. Social Media Generator
```javascript
// Creates platform-optimized social posts
const postResult = await aiCoreService.generateSocialPost(content, platform);
```

**Features:**
- Platform-specific optimization (LinkedIn, Twitter, Instagram)
- Engagement scoring
- Hashtag generation
- Trend analysis

#### 3. WhatsApp Automation AI
```javascript
// Processes WhatsApp messages with AI responses
const response = await aiCoreService.processWhatsAppMessage(message, context);
```

**Features:**
- Intent classification
- Automated responses
- Business context awareness
- Follow-up suggestions

#### 4. Data Insights Engine
```javascript
// Analyzes data and generates actionable insights
const insights = await aiCoreService.generateInsights(data, analysisType);
```

**Features:**
- Pattern recognition
- Predictive analytics
- Visual report generation
- Business recommendations

#### 5. Audience Targeting AI
```javascript
// Creates detailed audience segments
const segments = await aiCoreService.generateAudienceSegments(criteria);
```

**Features:**
- Demographic analysis
- Psychographic profiling
- Targeting strategies
- Market potential assessment

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
```sql
-- Users table (extends existing auth system)
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  phone_number VARCHAR,
  google_id VARCHAR,
  avatar_url VARCHAR,
  is_verified BOOLEAN,
  phone_verified BOOLEAN,
  preferences JSONB,
  created_at TIMESTAMP
);

-- OTP verifications
otp_verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email VARCHAR,
  phone_number VARCHAR,
  otp_code VARCHAR,
  verification_type VARCHAR,
  expires_at TIMESTAMP,
  is_verified BOOLEAN
);
```

#### AI System Tables
```sql
-- AI prompt templates
ai_prompt_templates (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,
  content TEXT,
  module VARCHAR,
  variables JSONB,
  is_active BOOLEAN
);

-- AI generations
ai_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  module VARCHAR,
  input_data JSONB,
  output_data JSONB,
  metadata JSONB,
  confidence_score FLOAT
);

-- User CVs
user_cvs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  cv_data JSONB,
  generated_cv TEXT,
  format VARCHAR,
  is_public BOOLEAN
);
```

#### Automation System
```sql
-- Automations
automations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR,
  description TEXT,
  triggers JSONB,
  actions JSONB,
  conditions JSONB,
  settings JSONB,
  status VARCHAR
);

-- Automation executions
automation_executions (
  id UUID PRIMARY KEY,
  automation_id UUID REFERENCES automations(id),
  trigger_data JSONB,
  execution_results JSONB,
  status VARCHAR,
  executed_at TIMESTAMP
);
```

#### WhatsApp Integration
```sql
-- WhatsApp messages
whatsapp_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  to_number VARCHAR,
  message_content TEXT,
  direction VARCHAR,
  status VARCHAR,
  message_id VARCHAR
);

-- WhatsApp interactions
whatsapp_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  incoming_message TEXT,
  ai_response TEXT,
  intent VARCHAR,
  confidence FLOAT
);
```

## 🔄 API Architecture

### RESTful API Design

#### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
GET  /api/auth/me                # Get user profile
PUT  /api/auth/me                # Update profile
POST /api/auth/send-email-otp    # Send email OTP
POST /api/auth/send-sms-otp      # Send SMS OTP
POST /api/auth/verify-otp        # Verify OTP
GET  /api/auth/google            # Google OAuth
```

#### AI Core Endpoints
```
POST /api/ai/cv                  # Generate CV
POST /api/ai/social              # Generate social post
POST /api/ai/whatsapp             # Process WhatsApp message
POST /api/ai/insights            # Generate insights
POST /api/ai/audience            # Generate audience segments
GET  /api/ai/generations         # Get AI generations history
GET  /api/ai/performance         # Get AI performance stats
```

#### Automation Endpoints
```
POST   /api/automations          # Create automation
GET    /api/automations          # Get user automations
GET    /api/automations/:id      # Get single automation
PUT    /api/automations/:id      # Update automation
DELETE /api/automations/:id      # Delete automation
POST   /api/automations/:id/execute # Execute automation
GET    /api/automations/:id/executions # Get executions
```

#### WhatsApp Endpoints
```
POST /api/whatsapp/send          # Send WhatsApp message
GET  /api/whatsapp/analytics     # Get analytics
GET  /api/whatsapp/interactions  # Get recent interactions
GET  /api/whatsapp/messages      # Get message history
PUT  /api/whatsapp/settings      # Update settings
POST /api/whatsapp/broadcasts    # Create broadcast
```

## 🎨 Frontend Architecture

### Component Structure

```
zyra-frontend/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── overview/page.tsx    # Overview dashboard
│   │   ├── ai-tools/page.tsx    # AI tools page
│   │   ├── automations/page.tsx # Automations page
│   │   ├── whatsapp/page.tsx   # WhatsApp page
│   │   └── settings/page.tsx   # Settings page
│   └── layout.tsx               # Root layout
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── top-bar.tsx          # Top navigation
│   │   └── floating-assistant.tsx # AI assistant
│   ├── auth/
│   │   └── auth-modal.tsx       # Authentication modal
│   └── ui/                      # Reusable UI components
├── contexts/
│   └── auth-context.tsx         # Authentication context
└── lib/
    └── api-client.ts            # API client
```

### Design System

#### Color Palette
```css
:root {
  --zyra-violet: #8B5CF6;        /* Primary */
  --zyra-teal: #14B8A6;          /* Secondary */
  --zyra-cyan: #0EA5E9;          /* Accent */
  --zyra-electric-violet: #8B5CF6;
  --zyra-cyan-blue: #06B6D4;
  --zyra-bg: #0F172A;            /* Background */
  --zyra-glass: rgba(255, 255, 255, 0.1);
}
```

#### Typography
```css
.font-cyber {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
}

.gradient-text {
  background: linear-gradient(135deg, #8B5CF6, #14B8A6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🔧 Backend Architecture

### Service Layer

```
backend/src/
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── aiController.js          # AI operations
│   ├── automationController.js  # Automation logic
│   └── whatsappController.js    # WhatsApp integration
├── services/
│   ├── aiCoreService.js         # AI Core system
│   ├── otpService.js            # OTP handling
│   ├── googleAuthService.js     # Google OAuth
│   └── whatsappService.js       # WhatsApp service
├── middleware/
│   └── auth.js                  # Authentication middleware
├── routes/
│   ├── auth.js                  # Auth routes
│   ├── ai.js                    # AI routes
│   ├── automations.js           # Automation routes
│   └── whatsapp.js              # WhatsApp routes
└── config/
    ├── database.js              # Database configuration
    └── socketio.js              # Socket.IO setup
```

### AI Core Implementation

#### Prompt Template System
```javascript
// Dynamic prompt templates stored in database
const promptTemplate = await db('ai_prompt_templates')
  .where({ name: 'cv_builder', is_active: true })
  .first();

const systemPrompt = `You are Zyra AI, an expert CV builder...`;
```

#### Context Injection
```javascript
// Inject dynamic context into AI prompts
const context = {
  user_id: userId,
  industry: userData.industry,
  experience_level: userData.experience,
  preferences: preferences
};
```

#### Response Parsing
```javascript
// Parse AI responses into structured data
const parseAIResponse = (response, module) => {
  switch (module) {
    case 'cv_builder':
      return parseCVResponse(response);
    case 'social_generator':
      return parseSocialResponse(response);
    // ... other modules
  }
};
```

## 🚀 Scalability Design

### Horizontal Scaling

#### Load Balancing
```nginx
# nginx.conf - Multiple backend instances
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

#### Database Scaling
```sql
-- Read replicas for read operations
-- Connection pooling for better performance
-- Indexing strategy for optimal queries
```

#### Caching Strategy
```javascript
// Multi-layer caching
const cache = {
  L1: 'In-memory cache',
  L2: 'Redis cache',
  L3: 'Database cache'
};
```

### Performance Optimization

#### Database Optimization
```sql
-- Strategic indexing
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at);
```

#### Query Optimization
```javascript
// Efficient queries with proper joins
const userWithAutomations = await db('users')
  .select('users.*', 'automations.name as automation_name')
  .leftJoin('automations', 'users.id', 'automations.user_id')
  .where('users.id', userId);
```

#### Caching Implementation
```javascript
// Redis caching for frequently accessed data
const cacheKey = `user:${userId}:profile`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const user = await db('users').where({ id: userId }).first();
await redis.setex(cacheKey, 3600, JSON.stringify(user));
```

## 🔒 Security Architecture

### Authentication & Authorization

#### JWT Implementation
```javascript
// Secure JWT tokens with proper expiration
const token = jwt.sign(
  { userId, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

#### OAuth Integration
```javascript
// Google OAuth with Passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  // Handle OAuth callback
}));
```

### Data Security

#### Encryption
```javascript
// Encrypt sensitive data
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
```

#### Input Validation
```javascript
// Comprehensive input validation
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 })
];
```

### Network Security

#### Rate Limiting
```javascript
// API rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

#### CORS Configuration
```javascript
// Secure CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📊 Monitoring & Observability

### Application Monitoring

#### Health Checks
```javascript
// Comprehensive health checks
const healthCheck = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  database: await checkDatabase(),
  redis: await checkRedis(),
  ai_services: await checkAIServices()
};
```

#### Metrics Collection
```javascript
// Custom metrics for monitoring
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});
```

### Logging Strategy

#### Structured Logging
```javascript
// Winston logger with structured logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Error Tracking
```javascript
// Comprehensive error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user_id: req.user?.userId
  });
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
```

## 🔄 CI/CD Pipeline

### Automated Deployment

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm test
          npm run test:integration
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

#### Quality Gates
```bash
# Automated quality checks
npm run lint          # Code linting
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run security      # Security audit
```

## 📈 Performance Metrics

### Key Performance Indicators

#### Response Times
- API endpoints: < 200ms
- AI generation: < 3s
- Database queries: < 100ms
- Page load times: < 2s

#### Throughput
- Concurrent users: 1000+
- API requests: 10,000+ per minute
- AI generations: 100+ per minute
- Database connections: 100+ concurrent

#### Availability
- Uptime: 99.9%
- Error rate: < 0.1%
- Recovery time: < 5 minutes

## 🛠️ Development Workflow

### Local Development

#### Setup
```bash
# Clone repository
git clone <repository-url>
cd Zyra

# Install dependencies
npm install

# Setup environment
cp backend/env.example backend/.env
cp zyra-frontend/env.example zyra-frontend/.env.local

# Start development servers
npm run dev
```

#### Development Commands
```bash
# Backend development
cd backend
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations

# Frontend development
cd zyra-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Testing Strategy

#### Unit Tests
```javascript
// Example unit test
describe('AI Core Service', () => {
  it('should generate CV successfully', async () => {
    const userData = { name: 'John Doe', experience: [] };
    const result = await aiCoreService.generateCV(userData);
    expect(result.success).toBe(true);
    expect(result.data.cv).toBeDefined();
  });
});
```

#### Integration Tests
```javascript
// Example integration test
describe('Authentication API', () => {
  it('should register user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🎯 Future Enhancements

### Planned Features

#### Advanced AI Capabilities
- Multi-modal AI (text, image, voice)
- Custom AI model training
- Advanced prompt engineering
- AI model fine-tuning

#### Enhanced Automation
- Visual workflow builder
- Advanced trigger conditions
- Cross-platform integrations
- Real-time collaboration

#### Analytics & Insights
- Advanced analytics dashboard
- Predictive analytics
- Business intelligence
- Custom reporting

### Scalability Roadmap

#### Phase 1: Current (MVP)
- Single region deployment
- Basic monitoring
- Core AI features
- Essential automations

#### Phase 2: Growth
- Multi-region deployment
- Advanced monitoring
- Enhanced AI capabilities
- Advanced automations

#### Phase 3: Scale
- Global deployment
- AI model optimization
- Enterprise features
- Advanced analytics

---

## 📚 Documentation

- [API Documentation](http://localhost:3001/api-docs)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Authentication Setup](./AUTHENTICATION_SETUP.md)
- [Database Schema](./database-schema.md)
- [AI Core Documentation](./ai-core-docs.md)

---

**Built with ❤️ by the Zyra Team**

*Empowering businesses with intelligent automation and AI-driven insights.*
