#!/bin/bash

# Zyra Authentication System Setup Script
# This script sets up the complete authentication system with PostgreSQL, OTP, and Google OAuth

echo "🚀 Setting up Zyra Authentication System..."

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

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL is installed"
        return 0
    else
        print_error "PostgreSQL is not installed"
        print_status "Please install PostgreSQL first:"
        print_status "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        print_status "macOS: brew install postgresql"
        print_status "Windows: Download from https://www.postgresql.org/download/"
        return 1
    fi
}

# Setup PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE zyra_db;" 2>/dev/null || print_warning "Database might already exist"
    sudo -u postgres psql -c "CREATE USER zyra_user WITH PASSWORD 'zyra_password';" 2>/dev/null || print_warning "User might already exist"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zyra_db TO zyra_user;" 2>/dev/null || print_warning "Privileges might already be granted"
    
    print_success "Database setup completed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    cd backend
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    cd zyra-frontend
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    npm run setup-db
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Failed to run database migrations"
        exit 1
    fi
    
    cd ..
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env file"
        print_warning "Please update backend/.env with your actual values"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend .env.local
    if [ ! -f zyra-frontend/.env.local ]; then
        cp zyra-frontend/env.example zyra-frontend/.env.local
        print_success "Created zyra-frontend/.env.local file"
        print_warning "Please update zyra-frontend/.env.local with your actual values"
    else
        print_warning "zyra-frontend/.env.local already exists"
    fi
}

# Test the system
test_system() {
    print_status "Testing the authentication system..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Test backend health
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend server is running"
    else
        print_error "Backend server failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd zyra-frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 10
    
    # Test frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend server is running"
    else
        print_error "Frontend server failed to start"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    
    print_success "🎉 Authentication system is running!"
    print_status "Backend: http://localhost:3001"
    print_status "Frontend: http://localhost:3000"
    print_status "API Docs: http://localhost:3001/api-docs"
    
    print_warning "Press Ctrl+C to stop the servers"
    
    # Wait for user to stop
    wait
}

# Main execution
main() {
    echo "=========================================="
    echo "    Zyra Authentication System Setup    "
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    if ! check_postgresql; then
        exit 1
    fi
    
    # Setup database
    setup_database
    
    # Install dependencies
    install_backend_deps
    install_frontend_deps
    
    # Create environment files
    create_env_files
    
    # Run migrations
    run_migrations
    
    # Test the system
    test_system
}

# Run main function
main "$@"
