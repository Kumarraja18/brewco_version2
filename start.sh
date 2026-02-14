#!/bin/bash

# Brew & Co - Start Script
# Loads environment variables from .env and starts both backend and frontend

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load environment variables from .env file
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo "✓ Loading environment variables from .env"
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
else
    echo "✗ ERROR: .env file not found!"
    echo "  Copy .env.example to .env and fill in your credentials:"
    echo "    cp .env.example .env"
    exit 1
fi

# Kill existing processes on ports 8080 and 5173
echo "Stopping existing services..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Start Backend
echo "Starting backend on port 8080..."
cd "$SCRIPT_DIR/backend"
nohup mvn spring-boot:run > "$SCRIPT_DIR/backend/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/admin/dashboard-stats > /dev/null 2>&1; then
        echo "✓ Backend is running on http://localhost:8080"
        break
    fi
    sleep 2
done

# Start Frontend
echo "Starting frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
nohup npm run dev > "$SCRIPT_DIR/frontend/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 2

echo "✓ Frontend is running on http://localhost:5173"
echo ""
echo "========================================="
echo "  Brew & Co is ready!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo "========================================="
echo ""
echo "Logs:"
echo "  Backend:  tail -f $SCRIPT_DIR/backend/backend.log"
echo "  Frontend: tail -f $SCRIPT_DIR/frontend/frontend.log"
