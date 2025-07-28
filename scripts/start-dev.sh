#!/bin/bash

# Development startup script for chatbot project

set -e

echo "🚀 Starting chatbot development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Copying development environment file..."
    cp .env.development .env
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Initialize Chroma with sample data
echo "🔍 Initializing Chroma vector database..."
docker-compose exec backend python /app/chroma-init/init-chroma.py || true

# Show service status
echo "📊 Service status:"
docker-compose ps

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Access points:")
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8001"
echo "  Backend Docs: http://localhost:8001/docs"
echo "  PostgreSQL: localhost:5432"
echo "  Chroma: http://localhost:8000"
echo ""
echo "📝 To view logs: docker-compose logs -f [service]"
echo "🛑 To stop: docker-compose down"