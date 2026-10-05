#!/usr/bin/env node

/**
 * Generate Self-Signed Certificate using node-forge
 * Works on all platforms without OpenSSL
 */

const fs = require('fs');
const path = require('path');

// Try to load node-forge
let forge;
try {
  forge = require('node-forge');
} catch (e) {
  console.error('❌ node-forge not installed');
  console.error('Run: npm install');
  process.exit(1);
}

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

try {
  // Generate RSA key pair
  console.log('  Generating RSA key pair...');
  const pki = forge.pki;
  const keys = pki.rsa.generateKeyPair(2048);

  // Create certificate
  console.log('  Creating certificate...');
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;

  // Set certificate fields
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

  const attrs = [
    {
      name: 'commonName',
      value: 'localhost'
    },
    {
      name: 'organizationName',
      value: 'YAS Hardware Agent'
    },
    {
      shortName: 'ST',
      value: 'Local'
    },
    {
      shortName: 'C',
      value: 'US'
    }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Set extensions
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: false,
      objsign: false,
      sslCA: true,
      emailCA: false,
      objCA: false
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2, // DNS
          value: 'localhost'
        },
        {
          type: 2, // DNS
          value: '*.localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        },
        {
          type: 7, // IP
          ip: '::1'
        }
      ]
    }
  ]);

  // Self-sign certificate
  console.log('  Self-signing certificate...');
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Convert keys to PEM format
  const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
  const certPem = pki.certificateToPem(cert);

  // Write files
  console.log('  Writing certificate files...');
  fs.writeFileSync(keyFile, privateKeyPem);
  fs.writeFileSync(certFile, certPem);

  console.log('\n✓ SSL Certificate generated successfully!');
  console.log(`  Private Key: ${keyFile}`);
  console.log(`  Certificate: ${certFile}`);
  console.log(`  Valid Until: ${cert.validity.notAfter.toLocaleDateString()}`);
  console.log(`  Subject: ${cert.subject.getField('CN').value}`);
  console.log('\n✓ Ready to start proxy!\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Error generating certificate:');
  console.error('  ', error.message);
  process.exit(1);
}
