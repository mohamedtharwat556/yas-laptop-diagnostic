@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   HTTPS Proxy - Start Script               ║
echo ╚════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Node.js not found!
    echo    Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if certificates exist - if not, run setup
if not exist "certs\localhost.crt" (
    echo 🔐 Certificates not found, running setup...
    call setup-all.cmd
    exit /b !errorlevel!
)

if not exist "certs\localhost.key" (
    echo ❌ Key file not found: certs\localhost.key
    echo    Run: setup-all.cmd
    pause
    exit /b 1
)

echo ✓ SSL certificates ready
echo ✓ Dependencies ready
echo.
echo 🚀 Starting HTTPS Proxy Server...
echo.
echo Server will listen on: https://127.0.0.1:443
echo Forwarding to: http://127.0.0.1:5275
echo.
echo Health check: https://127.0.0.1:443/proxy-health
echo Status check: https://127.0.0.1:443/proxy-status
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js
