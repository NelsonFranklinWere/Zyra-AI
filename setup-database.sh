#!/bin/bash

# Zyra Database Setup Script
echo "🚀 Setting up Zyra Database..."

# Database configuration
DB_NAME="zyra_db"
DB_USER="zyra_user"
DB_PASSWORD="zyra_secure_password_2025"

# Create database and user
echo "📊 Creating database and user..."

# Switch to postgres user and create database
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Enable UUID extension
\c $DB_NAME;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit
\q
EOF

echo "✅ Database and user created successfully!"
echo "📋 Database Details:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   Host: localhost"
echo "   Port: 5432"

echo ""
echo "🔧 Next steps:"
echo "1. Update your .env files with these credentials"
echo "2. Run migrations: cd backend && npm run migrate"
echo "3. Add sample data: npm run seed"
