#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "============================================"
echo "   APKScan — Android APK Threat Analyzer"
echo "============================================"

# Start backend
echo ""
echo "[1/2] Starting backend..."
cd "$SCRIPT_DIR/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies quietly
echo "Installing Python dependencies..."
pip install -r requirements.txt -q

# Start uvicorn
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Start frontend
echo ""
echo "[2/2] Starting frontend..."
cd "$SCRIPT_DIR/frontend"
npm install -q --silent
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "============================================"
echo "Backend  running on http://localhost:8000"
echo "Frontend running on http://localhost:5173"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo "Done."
}

trap cleanup INT TERM
wait
