#!/bin/bash

echo "================================"
echo "  DayBook - Quick Start Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker first:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo ""
    exit 1
fi

echo "✓ Docker is installed"

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available!"
    echo ""
    echo "Please install Docker Compose or update Docker to a newer version."
    exit 1
fi

echo "✓ Docker Compose is available"
echo ""

# Build and start containers
echo "Building Docker containers..."
docker compose build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Check the errors above."
    exit 1
fi

echo ""
echo "Starting containers..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to start containers! Check the errors above."
    exit 1
fi

echo ""
echo "================================"
echo "✓ DayBook is now running!"
echo "================================"
echo ""
echo "Access the application:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Useful commands:"
echo "  View logs:        docker compose logs -f"
echo "  Stop:             docker compose down"
echo "  Restart:          docker compose restart"
echo ""
