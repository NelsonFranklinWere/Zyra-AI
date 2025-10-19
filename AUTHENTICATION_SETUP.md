# Zyra Authentication System Setup Guide

This guide will help you set up the complete authentication system for Zyra, including PostgreSQL database, OTP verification, and Google OAuth integration.

## 🚀 Quick Start

Run the automated setup script:

```bash
./setup-auth-system.sh
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/)

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE zyra_db;
CREATE USER zyra_user WITH PASSWORD 'zyra_password';
GRANT ALL PRIVILEGES ON DATABASE zyra_db TO zyra_user;
\q
```

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Update the following variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyra_db
DB_USER=zyra_user
DB_PASSWORD=zyra_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Email Service (Required for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# SMS Service (Required for OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Google OAuth (Required for Google Sign-in)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your_session_secret_here
```

### 3. Run Database Migrations

```bash
npm run setup-db
```

### 4. Start Backend Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd zyra-frontend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

Update the following variables in `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Zyra
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Frontend Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔐 Authentication Features

### 1. User Registration
- Email and password registration
- Phone number (optional)
- Automatic email verification via OTP

### 2. User Login
- Email/password authentication
- Google OAuth integration
- JWT token-based sessions

### 3. OTP Verification
- Email OTP for account verification
- SMS OTP for phone verification
- 6-digit codes with 10-minute expiration
- Rate limiting and attempt tracking

### 4. Google OAuth
- One-click Google sign-in
- Automatic account linking
- Profile information sync

## 📱 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get user profile |
| PUT | `/api/auth/me` | Update user profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/verify-email` | Verify email with token |

### OTP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-email-otp` | Send OTP to email |
| POST | `/api/auth/send-sms-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP code |

### Google OAuth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/link-google` | Link Google account |
| POST | `/api/auth/unlink-google` | Unlink Google account |

## 🛠️ Third-Party Services Setup

### 1. Email Service (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the app password in your `.env` file

### 2. SMS Service (Twilio)

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number for SMS
4. Update your `.env` file with the credentials

### 3. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret to your `.env` file

## 🧪 Testing the System

### 1. Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
  }'
```

### 2. Test OTP Verification

```bash
# Send OTP
curl -X POST http://localhost:3001/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# Verify OTP
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "otpCode": "123456",
    "verificationType": "email",
    "email": "john@example.com"
  }'
```

### 3. Test Google OAuth

Visit: `http://localhost:3001/api/auth/google`

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Rate limiting on OTP requests
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Session management

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `first_name` (String)
- `last_name` (String)
- `phone_number` (String, Optional)
- `google_id` (String, Optional)
- `google_email` (String, Optional)
- `avatar_url` (String, Optional)
- `role` (String, Default: 'user')
- `is_active` (Boolean, Default: true)
- `is_verified` (Boolean, Default: false)
- `phone_verified` (Boolean, Default: false)
- `preferences` (JSONB)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### OTP Verifications Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `email` (String, Optional)
- `phone_number` (String, Optional)
- `otp_code` (String)
- `verification_type` (String: 'email' or 'sms')
- `is_verified` (Boolean, Default: false)
- `expires_at` (Timestamp)
- `verified_at` (Timestamp, Optional)
- `attempts` (Integer, Default: 0)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **OTP Not Sending**
   - Check email/SMS service credentials
   - Verify service is properly configured
   - Check rate limiting

3. **Google OAuth Not Working**
   - Verify redirect URI matches exactly
   - Check client ID and secret
   - Ensure Google+ API is enabled

4. **Frontend API Errors**
   - Check API URL configuration
   - Verify backend is running
   - Check CORS settings

### Logs

Backend logs are available in the console and can be configured in `src/utils/logger.js`

## 📝 Next Steps

1. **Production Deployment**
   - Use environment-specific configurations
   - Set up SSL certificates
   - Configure production database
   - Set up monitoring and logging

2. **Additional Features**
   - Social login (Facebook, Twitter)
   - Multi-factor authentication
   - Account recovery
   - User management dashboard

3. **Security Enhancements**
   - IP whitelisting
   - Device fingerprinting
   - Advanced rate limiting
   - Security headers

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation at `http://localhost:3001/api-docs`
- Check the logs for detailed error messages

---

**Happy coding! 🎉**
