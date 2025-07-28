#!/bin/bash

# Test runner script for chatbot project

set -e

echo "🧪 Running chatbot project tests..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Copy test environment file
if [ ! -f .env.test ]; then
    echo "📋 Copying test environment file..."
    cp .env.test .env
fi

# Build and start test services
echo "🔨 Building and starting test services..."
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Get exit codes
BACKEND_EXIT_CODE=$(docker-compose -f docker-compose.test.yml ps -q backend-test | xargs docker inspect --format='{{.State.ExitCode}}')
FRONTEND_EXIT_CODE=$(docker-compose -f docker-compose.test.yml ps -q frontend-test | xargs docker inspect --format='{{.State.ExitCode}}')

# Clean up
echo "🧹 Cleaning up test containers..."
docker-compose -f docker-compose.test.yml down -v

# Report results
echo "📊 Test Results:"
echo "  Backend tests: $([ "$BACKEND_EXIT_CODE" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "  Frontend tests: $([ "$FRONTEND_EXIT_CODE" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"

# Exit with error if any tests failed
if [ "$BACKEND_EXIT_CODE" -ne 0 ] || [ "$FRONTEND_EXIT_CODE" -ne 0 ]; then
    echo "❌ Some tests failed!"
    exit 1
else
    echo "✅ All tests passed!"
    exit 0
fi