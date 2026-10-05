@echo off
REM Complete Setup Script - Certificate Generation and Dependencies
REM Tries multiple methods to create SSL certificate

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   Complete HTTPS Proxy Setup                      ║
echo ╚═══════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Step 1: Check Node.js
echo Step 1: Checking Node.js...
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Node.js not found!
    echo    Please install from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found
node --version

REM Step 2: Install dependencies
echo.
echo Step 2: Installing npm dependencies...
if not exist "node_modules" (
    call npm install
    if !errorlevel! neq 0 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

REM Step 3: Create certificates
echo.
echo Step 3: Creating SSL certificate...

if exist "certs\localhost.crt" if exist "certs\localhost.key" (
    echo ✓ Certificates already exist
    goto :start_proxy
)

REM Try Method 1: Node.js certificate generator (no external tools needed)
echo   Trying Node.js certificate generator...
node generate-cert-nodejs.js
if !errorlevel! equ 0 (
    echo ✓ Certificate created with Node.js
    goto :verify_cert
)

REM Try Method 2: mkcert
where mkcert >nul 2>&1
if !errorlevel! equ 0 (
    echo   Trying mkcert...
    call setup-cert-mkcert.cmd
    if !errorlevel! equ 0 (
        echo ✓ Certificate created with mkcert
        goto :verify_cert
    )
)

REM Try Method 3: OpenSSL
where openssl >nul 2>&1
if !errorlevel! equ 0 (
    echo   Trying OpenSSL...
    call setup-cert-openssl.cmd
    if !errorlevel! equ 0 (
        echo ✓ Certificate created with OpenSSL
        goto :verify_cert
    )
)

REM Failed
echo.
echo ❌ Could not create certificate automatically
echo.
echo Please install one of these tools:
echo   - mkcert: https://github.com/FiloSottile/mkcert/releases
echo   - OpenSSL: https://slproweb.com/products/Win32OpenSSL.html
echo   - Git Bash (includes OpenSSL): https://git-scm.com/download/win
echo.
pause
exit /b 1

:verify_cert
REM Verify certificates exist
if not exist "certs\localhost.crt" (
    echo ❌ Certificate file not found
    pause
    exit /b 1
)
if not exist "certs\localhost.key" (
    echo ❌ Key file not found
    pause
    exit /b 1
)
echo ✓ Certificates verified

:start_proxy
REM Step 4: Ready to start
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   Setup Complete!                                ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo Configuration:
echo   - HTTPS Server: https://127.0.0.1:443
echo   - Forward To: http://127.0.0.1:5275
echo   - Health Check: https://127.0.0.1:443/proxy-health
echo.
echo Ready to start the proxy server.
echo Press any key to start...
pause >nul

echo.
echo 🚀 Starting HTTPS Proxy...
echo.

npm start
