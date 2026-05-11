#!/bin/bash

# Start InterviewGPT - Frontend & Backend

echo ""
echo "========================================"
echo "    InterviewGPT Development Server"
echo "========================================"
echo ""

# Check if required commands exist
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found. Please install Python 3.9+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js/npm not found. Please install Node.js 18+"
    exit 1
fi

echo "Starting InterviewGPT with both frontend and backend..."
echo ""
echo "Backend will start on:  http://localhost:8000"
echo "Frontend will start on: http://localhost:5173"
echo ""

# Create a trap to kill both processes on exit
cleanup() {
    echo "Stopping services..."
    kill $backend_pid $frontend_pid 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend..."
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
backend_pid=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm install
npm run dev &
frontend_pid=$!
cd ..

echo ""
echo "Both services are running..."
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait
