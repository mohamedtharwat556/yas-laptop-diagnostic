#!/usr/bin/env node

/**
 * Generate Self-Signed Certificate using Node.js crypto
 * Works on all platforms without OpenSSL
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certs');
const certFile = path.join(certDir, 'localhost.crt');
const keyFile = path.join(certDir, 'localhost.key');

// Ensure certs directory exists
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Check if certificates already exist
if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
  console.log('✓ Certificate already exists');
  console.log('  Cert:', certFile);
  console.log('  Key:', keyFile);
  process.exit(0);
}

console.log('📝 Generating self-signed certificate for localhost...\n');

// Try method 1: Using Node's crypto (newer versions)
try {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    }
  });

  // For self-signed certificates, we need more tools
  // Try to use mkcert if available
  tryMkcert();
} catch (error) {
  console.log('Attempting alternative methods...\n');
  tryMkcert();
}

function tryMkcert() {
  // Check if mkcert is available
  try {
    execSync('where mkcert', { stdio: 'ignore' });
    console.log('✓ Found mkcert, using it to generate certificate...\n');
    
    try {
      execSync(`mkcert -install`, { stdio: 'ignore' });
      execSync(`mkcert -key-file "${keyFile}" -cert-file "${certFile}" localhost 127.0.0.1`, {
        cwd: certDir
      });
      
      console.log('✓ Certificate generated successfully with mkcert');
      console.log('  Cert:', certFile);
      console.log('  Key:', keyFile);
      console.log('\n✓ Ready to start proxy!\n');
      process.exit(0);
    } catch (error) {
      console.log('⚠️  mkcert execution failed, trying next method...\n');
    }
  } catch (error) {
    // mkcert not found
  }
  
  tryOpenSSL();
}

function tryOpenSSL() {
  try {
    execSync('where openssl', { stdio: 'ignore' });
    console.log('✓ Found OpenSSL, using it to generate certificate...\n');
    
    const cmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=localhost"`;
    execSync(cmd, { cwd: certDir });
    
    console.log('✓ Certificate generated successfully with OpenSSL');
    console.log('  Cert:', certFile);
    console.log('  Key:', keyFile);
    console.log('\n✓ Ready to start proxy!\n');
    process.exit(0);
  } catch (error) {
    console.log('⚠️  OpenSSL not found\n');
    fallbackMethod();
  }
}

function fallbackMethod() {
  console.log('⚠️  Could not find automatic certificate generation tools\n');
  console.log('Options:\n');
  console.log('1. Install mkcert (easiest):');
  console.log('   https://github.com/FiloSottile/mkcert\n');
  console.log('2. Install OpenSSL:');
  console.log('   Windows: https://slproweb.com/products/Win32OpenSSL.html\n');
  console.log('3. Use Git Bash (includes OpenSSL):\n');
  console.log('4. Create certificate manually:\n');
  console.log('   Using Git Bash or WSL:\n');
  console.log('   openssl req -x509 -newkey rsa:2048 -keyout certs/localhost.key \\');
  console.log('     -out certs/localhost.crt -days 365 -nodes -subj "/CN=localhost"\n');
  console.log('After installing tools, run this script again.');
  
  process.exit(1);
}
