# 🗄️ Zyra Database Setup Guide

## Prerequisites
- PostgreSQL 14+ installed
- Node.js and npm installed
- Access to terminal with sudo privileges

## Step 1: Create Database and User

Run these commands in your terminal:

```bash
# Switch to postgres user and create database
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE zyra_db;
CREATE USER zyra_user WITH PASSWORD 'zyra_secure_password_2025';
GRANT ALL PRIVILEGES ON DATABASE zyra_db TO zyra_user;
GRANT ALL ON SCHEMA public TO zyra_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO zyra_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO zyra_user;

# Connect to the database and enable UUID extension
\c zyra_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit PostgreSQL
\q
```

## Step 2: Update Environment Files

### Backend .env
Update `/home/frank/Documents/VS Code/Projects/Zyra/backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyra_db
DB_USER=zyra_user
DB_PASSWORD=zyra_secure_password_2025
DB_URL=postgresql://zyra_user:zyra_secure_password_2025@localhost:5432/zyra_db

# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=zyra_super_secret_jwt_key_2025_make_it_long_and_random
JWT_EXPIRES_IN=7d
SESSION_SECRET=zyra_session_secret_2025

# AI Services (Add your API keys)
OPENAI_API_KEY=sk-your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google OAuth (Add your credentials)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# WhatsApp Business API (Add your credentials)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here

# Twilio SMS (Add your credentials)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Email Service (Add your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# n8n Integration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Frontend URL
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Security
INTERNAL_API_KEY=zyra_internal_api_key_2025
WEBHOOK_SECRET=zyra_webhook_secret_2025

# Feature Flags
ENABLE_WHATSAPP_AUTOMATION=true
ENABLE_SOCIAL_MEDIA_AUTOMATION=true
ENABLE_EMAIL_AUTOMATION=true
ENABLE_AI_INSIGHTS=true
```

### Frontend .env.local
Update `/home/frank/Documents/VS Code/Projects/Zyra/zyra-frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Zyra
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Install Dependencies and Run Migrations

```bash
# Navigate to backend directory
cd /home/frank/Documents/VS\ Code/Projects/Zyra/backend

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

## Step 4: Verify Database Setup

```bash
# Connect to database to verify
psql -h localhost -U zyra_user -d zyra_db

# List all tables
\dt

# Exit
\q
```

## Step 5: Start the Application

```bash
# Start backend (Terminal 1)
cd /home/frank/Documents/VS\ Code/Projects/Zyra/backend
npm run dev

# Start frontend (Terminal 2)
cd /home/frank/Documents/VS\ Code/Projects/Zyra/zyra-frontend
npm run dev
```

## Database Tables Created

The following tables will be created:

### Core Tables
- `users` - User accounts and authentication
- `otp_verifications` - OTP verification system
- `automations` - Workflow automations
- `data_sources` - Data source configurations
- `ai_insights` - AI-generated insights
- `execution_logs` - Automation execution logs

### AI Tables
- `ai_prompt_templates` - AI prompt templates
- `ai_generations` - AI generation history
- `user_cvs` - User CV data
- `user_social_posts` - Social media posts
- `user_insights` - User insights
- `user_audience_segments` - Audience targeting
- `user_ai_preferences` - AI preferences

### WhatsApp Tables
- `whatsapp_messages` - WhatsApp messages
- `whatsapp_interactions` - AI interactions
- `whatsapp_settings` - WhatsApp settings
- `whatsapp_broadcasts` - Broadcast campaigns
- `whatsapp_templates` - Message templates
- `whatsapp_analytics` - Analytics data
- `support_tickets` - Support system
- `demo_requests` - Demo scheduling

### Webhook Tables
- `webhook_endpoints` - Webhook configurations
- `webhook_events` - Webhook event logs

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you have sudo access
2. **Database Connection Failed**: Check if PostgreSQL is running
3. **Migration Errors**: Ensure all dependencies are installed
4. **Port Conflicts**: Make sure ports 3000 and 3001 are available

### Useful Commands

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database connection
psql -h localhost -U zyra_user -d zyra_db -c "SELECT version();"
```

## Next Steps

1. ✅ Database created and configured
2. ✅ Environment files updated
3. ✅ Migrations run successfully
4. ✅ Sample data added
5. 🚀 Ready to start development!

Your Zyra database is now ready for development! 🎉
