@echo off
REM Setup Certificate using mkcert
REM https://github.com/FiloSottile/mkcert

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

echo 📝 Generating certificate with mkcert...

REM Check if mkcert is installed
where mkcert >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ mkcert not found!
    echo.
    echo Please install mkcert:
    echo https://github.com/FiloSottile/mkcert/releases
    echo.
    echo Or use setup-cert-openssl.cmd instead
    exit /b 1
)

REM Create the certificate
mkcert -key-file "%KEY_FILE%" -cert-file "%CERT_FILE%" localhost 127.0.0.1

if !errorlevel! neq 0 (
    echo ❌ Failed to generate certificate with mkcert
    exit /b 1
)

echo ✓ Certificate created successfully
echo   Cert: %CERT_FILE%
echo   Key: %KEY_FILE%
echo.
echo Ready to start proxy!
