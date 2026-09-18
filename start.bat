@echo off
chcp 65001 >nul
title SafeRx Healthcare Platform - Launcher
color 0B

echo ================================================================
echo             SafeRx - Digital Prescription Platform
echo        Connect. Prescribe. Dispense. Safely.
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
) else (
    echo [1/3] Dependencies verified.
)

echo [2/3] Starting SafeRx Application Server...
echo.
echo SafeRx will open in your default browser at: http://localhost:3000
echo.

start "" "http://localhost:3000"
echo [3/3] Server running. Press Ctrl+C to stop.
echo ================================================================
npm run dev
pause
