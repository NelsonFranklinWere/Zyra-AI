# 🚀 Zyra - AI Automation & Marketing Intelligence Platform

> **The future of business automation is here.** Zyra combines cutting-edge AI with intelligent workflow automation to transform how businesses operate in the digital economy (2025-2030).

## 🌟 Overview

Zyra is an advanced AI automation and marketing intelligence system designed for digital wholesalers, retailers, and modern businesses. We combine AI-driven data processing, customer segmentation, smart automation, and adaptive targeting to help businesses sell smarter — not louder.

**Mission**: Make every product reach the right person at the right time — targeting diverse audiences including kids, Gen Alpha, Gen Z youth, millennials, parents, and Gen X across all demographics and interests.

## 🎨 Design Philosophy

**Theme: "Neo-Futuristic Intelligence"** - A sleek, cyber-inspired design that embodies the future of automation and AI.

### Color Palette
- **Deep Navy**: `#0a0e27` - Primary background
- **Electric Violet**: `#8b5cf6` - Primary accent and AI elements
- **Cyan Blue**: `#06b6d4` - Secondary accent and highlights
- **Glass Effects**: Semi-transparent overlays with backdrop blur
- **Neon Glows**: Dynamic lighting effects for interactive elements

## 🏗️ Architecture

### Frontend (Next.js 14)
```
zyra-frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── sections/          # Page sections
│   └── shared/            # Shared components
├── lib/                   # Utility functions
├── styles/                # Global styles
└── public/                # Static assets
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── config/            # Configuration
├── migrations/            # Database migrations
├── seeds/                 # Database seeds
└── docs/                  # Documentation
```

## 🚀 Core Capabilities

### 🧠 AI Persona Engine
- Analyze uploaded customer or sales data
- Detect purchase patterns, interests, and demographics
- Create buyer personas (e.g., "Tech-Savvy Parents", "Young Professionals", "Family Shoppers", "Lifestyle Enthusiasts", "Value-Conscious Buyers")
- Continuously refine personas as new data arrives

### 🎯 Smart Channel Matching
- Identify which platform (WhatsApp, Instagram, TikTok, Telegram, Email) best fits each persona
- Automatically plan distribution schedules for maximum engagement
- Optimize post formats (image, text, caption tone, emojis) to match target platform

### 🎭 Intent-Based Marketing (Mood AI)
- Analyze product descriptions + trending keywords
- Detect emotional tone of current online conversations
- Suggest or auto-generate promotional messages that resonate with diverse audience preferences and cultural contexts

### 🔮 Predictive Targeting
- Identify new potential customers based on behavior, location, and interest similarity
- Recommend who to target next and where
- Use predictive models to prioritize high-conversion customers

### ✍️ AI Campaign Composer
- Generate campaign copy (captions, ads, posts, emails)
- Adapt language style to match target demographics (youth-friendly, professional, family-oriented, or emotional tone)
- Create multiple variants for A/B testing
- Integrate directly with automation tools (e.g., n8n) to schedule publishing

### 📊 Smart Funnel Tracker
- Monitor every customer journey (Impression → Click → Message → Purchase → Return)
- Visualize engagement, drop-off rates, and conversation quality
- Suggest follow-up messages or offers to convert leads

### 💰 Dynamic Pricing Advisor
- Analyze product demand, seasonality, and competition
- Suggest ideal selling prices and discount strategies
- Generate bundle offers automatically

### 🛡️ Trust & Lead Verification
- Score customers by engagement and purchase behavior
- Help sellers filter out spam, ghost buyers, and bots

## 🧱 Zyra Interaction Example

**User**: "Zyra, post my new sneaker collection to diverse audiences in Nairobi, add 10% profit margin and schedule WhatsApp + Instagram posts for Friday."

**Zyra should**:
1. Fetch sneaker data from PostgreSQL
2. Identify target personas = Young Professionals, Sports Enthusiasts, Fashion Lovers, Value Seekers
3. Add 10% margin to base prices
4. Generate captions tailored to each demographic
5. Create visuals or call to existing templates
6. Send tasks to n8n → publish Friday 6PM
7. Log results + engagement

## 🔁 Zyra's Feedback Loop

Every time a campaign runs:
1. Collect performance data (views, clicks, conversions)
2. Update persona and campaign rules
3. Refine future targeting and tone
4. Send insights dashboard summaries

## 💬 Tone and Brand Personality

Zyra speaks like a modern, confident, helpful AI assistant:

> "Hey 👋 Nelson, your sneaker collection is ready for diverse audiences. I found 4 target segments that will love it — and scheduled a Friday evening release (6PM peak engagement). Ready to boost sales 🚀?"

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript
- **Database**: PostgreSQL
- **ORM**: Knex.js
- **Authentication**: JWT
- **Real-time**: Socket.IO

### AI & Automation
- **AI Models**: OpenAI GPT-4, Claude, Local LLMs
- **Automation**: n8n workflow engine
- **AI Pipeline**: Langflow integration
- **Data Processing**: Custom AI services

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render/Railway
- **Database**: Supabase/Neon.tech
- **File Storage**: AWS S3/Cloudinary
- **Monitoring**: Winston logging

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Frontend Setup
```bash
cd zyra-frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure your .env file
npm run migrate
npm run dev
```

### Database Setup
```bash
# Create PostgreSQL database
createdb zyra_db

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

#### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyra_db
DB_USER=zyra_user
DB_PASSWORD=zyra_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Integrations
LANGFLOW_API_URL=http://localhost:7860
N8N_API_URL=http://localhost:5678
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend (Render/Railway)
```bash
# Build and deploy
npm run build
# Configure environment variables in hosting platform
```

### Database (Supabase/Neon)
```bash
# Connect to hosted PostgreSQL
# Update connection string in .env
# Run migrations on production
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile

### Automation Endpoints
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `PUT /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation
- `POST /api/automations/:id/execute` - Execute automation

### Data Processing Endpoints
- `POST /api/data/sources/upload` - Upload data file
- `POST /api/data/analyze` - Analyze data
- `GET /api/data/sources/:id/preview` - Preview data

### AI Endpoints
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/insights/generate` - Generate insights
- `GET /api/ai/insights` - List AI insights

### Dashboard Endpoints
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/activity` - Recent activity

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- SQL injection protection
- CORS configuration
- Helmet security headers
- Encrypted password storage

## 📈 Performance & Monitoring

- Real-time WebSocket updates
- Comprehensive logging with Winston
- Database query optimization
- Caching strategies
- Error tracking and monitoring
- Performance metrics collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.zyra.ai](https://docs.zyra.ai)
- Community: [Discord](https://discord.gg/zyra)
- Issues: [GitHub Issues](https://github.com/zyra/issues)

---

**Built with ❤️ for the future of automation**
# Zyra-AI
