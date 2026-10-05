const https = require('https');
const http = require('http');
const express = require('express');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Configuration
const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 443;
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 5275;

// Certificate paths
const certDir = path.join(__dirname, 'certs');
const certFile = path.join(certDir, 'localhost.crt');
const keyFile = path.join(certDir, 'localhost.key');

// Check if certificates exist
if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
  console.error('❌ Certificates not found!');
  console.error('   Expected:', certFile);
  console.error('   Expected:', keyFile);
  console.error('\nPlease run: node generate-cert.js');
  process.exit(1);
}

// Create Express app
const app = express();

// Create proxy
const proxy = httpProxy.createProxyServer({
  target: `http://${TARGET_HOST}:${TARGET_PORT}`,
  changeOrigin: false,
  followRedirects: true,
  timeout: 30000,
  proxyTimeout: 30000,
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: 'Failed to connect to hardware agent',
      target: `${TARGET_HOST}:${TARGET_PORT}`
    }));
  }
});

// Proxy response handler
proxy.on('proxyRes', (proxyRes, req, res) => {
  // Ensure CORS headers are present
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
});

// Middleware for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check endpoint
app.get('/proxy-health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HTTPS Proxy is running',
    uptime: process.uptime(),
    proxyConfig: {
      listeningOn: `https://${PROXY_HOST}:${PROXY_PORT}`,
      forwardingTo: `http://${TARGET_HOST}:${TARGET_PORT}`
    }
  });
});

// Status check endpoint
app.get('/proxy-status', (req, res) => {
  res.json({
    proxy: 'running',
    listeningOn: `${PROXY_HOST}:${PROXY_PORT}`,
    forwardingTo: `http://${TARGET_HOST}:${TARGET_PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Proxy all other requests
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  proxy.web(req, res);
});

// Read SSL certificates
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(keyFile, 'utf8'),
    cert: fs.readFileSync(certFile, 'utf8'),
    rejectUnauthorized: false
  };
  console.log('✓ SSL certificates loaded');
} catch (error) {
  console.error('❌ Failed to load SSL certificates:', error.message);
  process.exit(1);
}

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start server
httpsServer.listen(PROXY_PORT, PROXY_HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 HTTPS Proxy Server Started');
  console.log('='.repeat(60));
  console.log(`📡 Listening on: https://${PROXY_HOST}:${PROXY_PORT}`);
  console.log(`🔄 Forwarding to: http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`📋 Health Check: https://${PROXY_HOST}:${PROXY_PORT}/proxy-health`);
  console.log(`📋 Status Check: https://${PROXY_HOST}:${PROXY_PORT}/proxy-status`);
  console.log('='.repeat(60) + '\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down proxy server...');
  httpsServer.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// Error handling
httpsServer.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error('❌ Permission denied. HTTPS requires administrator privileges.');
    console.error('   Please run this script as Administrator.');
    process.exit(1);
  } else if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PROXY_PORT} is already in use.`);
    console.error('   Please close the other process or use a different port.');
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
