@echo off
REM Start InterviewGPT - Frontend & Backend

echo.
echo ========================================
echo    InterviewGPT Development Server
echo ========================================
echo.

REM Check if required commands exist
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python not found. Please install Python 3.9+
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js/npm not found. Please install Node.js 18+
    exit /b 1
)

echo Starting InterviewGPT with both frontend and backend...
echo.
echo Backend will start on:  http://localhost:8000
echo Frontend will start on: http://localhost:5173
echo.

REM Start backend in a new window
echo Starting backend...
start "InterviewGPT Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Give backend time to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo Starting frontend...
start "InterviewGPT Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Services starting... Check the new windows for detailed output.
echo Press Ctrl+C in each window to stop the services.
echo.
pause
