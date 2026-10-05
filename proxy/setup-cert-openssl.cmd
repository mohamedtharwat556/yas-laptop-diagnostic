@echo off
REM Setup Self-Signed Certificate using OpenSSL
REM Requires OpenSSL to be installed or available in PATH

setlocal enabledelayedexpansion

set "CERT_DIR=%~dp0certs"
set "CERT_FILE=%CERT_DIR%\localhost.crt"
set "KEY_FILE=%CERT_DIR%\localhost.key"

REM Create certs directory
if not exist "%CERT_DIR%" (
    mkdir "%CERT_DIR%"
    echo ✓ Created certs directory
)

REM Check if certificates already exist
if exist "%CERT_FILE%" if exist "%KEY_FILE%" (
    echo ✓ Certificate already exists
    echo   Cert: %CERT_FILE%
    echo   Key: %KEY_FILE%
    exit /b 0
)

echo 📝 Generating self-signed certificate for localhost...

REM Try to find openssl
where openssl >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ OpenSSL not found in PATH
    echo.
    echo Options:
    echo 1. Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Use Git Bash which includes OpenSSL
    echo 3. Run setup-cert.ps1 for PowerShell alternative
    exit /b 1
)

REM Generate certificate
openssl req -x509 -newkey rsa:2048 -keyout "%KEY_FILE%" -out "%CERT_FILE%" -days 365 -nodes -subj "/CN=localhost"

if !errorlevel! neq 0 (
    echo ❌ Failed to generate certificate
    exit /b 1
)

echo ✓ Certificate generated successfully
echo   Cert: %CERT_FILE%
echo   Key: %KEY_FILE%
echo.
echo Ready to start proxy server!
