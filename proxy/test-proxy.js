#!/usr/bin/env node

/**
 * Test Script for HTTPS Proxy
 * Tests connectivity and basic functionality
 */

const https = require('https');

// Configuration
const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 443;
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 5275;

// Create agent that ignores certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false
});

console.log('\n╔══════════════════════════════════════╗');
console.log('║   HTTPS Proxy Test Suite              ║');
console.log('╚══════════════════════════════════════╝\n');

// Test 1: Proxy Health
console.log('Test 1: Proxy Health Check');
console.log('─────────────────────────');

https.get(`https://${PROXY_HOST}:${PROXY_PORT}/proxy-health`, { agent }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (res.statusCode === 200 && json.status === 'ok') {
        console.log('✅ PASS: Proxy is running\n');
        runTest2();
      } else {
        console.log('❌ FAIL: Unexpected response\n');
        console.log('Response:', json);
        process.exit(1);
      }
    } catch (e) {
      console.log('❌ FAIL: Invalid JSON response\n');
      console.log('Data:', data);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.log('❌ FAIL: Could not connect to proxy\n');
  console.log('Error:', err.message);
  console.log(`\nMake sure the proxy is running on https://${PROXY_HOST}:${PROXY_PORT}`);
  console.log('Run: npm start');
  process.exit(1);
});

function runTest2() {
  // Test 2: Proxy Status
  console.log('Test 2: Proxy Status Check');
  console.log('──────────────────────────');

  https.get(`https://${PROXY_HOST}:${PROXY_PORT}/proxy-status`, { agent }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (res.statusCode === 200 && json.proxy === 'running') {
          console.log('✅ PASS: Proxy status is running');
          console.log(`   Listening on: ${json.listeningOn}`);
          console.log(`   Forwarding to: ${json.forwardingTo}\n`);
          runTest3();
        } else {
          console.log('❌ FAIL: Unexpected status\n');
          process.exit(1);
        }
      } catch (e) {
        console.log('❌ FAIL: Invalid JSON response\n');
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.log('❌ FAIL: Could not get proxy status\n');
    process.exit(1);
  });
}

function runTest3() {
  // Test 3: Forward to Agent
  console.log('Test 3: Forward Request to Hardware Agent');
  console.log('─────────────────────────────────────────');

  https.get(`https://${PROXY_HOST}:${PROXY_PORT}/api/health`, { agent }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          console.log('✅ PASS: Request forwarded to Agent');
          console.log(`   Response: ${JSON.stringify(json)}\n`);
          runTest4();
        } catch (e) {
          console.log('✅ PASS: Request forwarded (non-JSON response)\n');
          runTest4();
        }
      } else if (res.statusCode === 502) {
        console.log('⚠️  WARNING: Proxy is running but Agent is not responding\n');
        console.log('   Make sure Hardware Agent is running on http://127.0.0.1:5275\n');
        console.log('   This is expected if Agent is not started yet.\n');
        runTest4();
      } else {
        console.log(`⚠️  WARNING: Unexpected status code ${res.statusCode}\n`);
        runTest4();
      }
    });
  }).on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) {
      console.log('⚠️  WARNING: Could not connect to Agent\n');
      console.log('   Make sure Hardware Agent is running on http://127.0.0.1:5275\n');
      runTest4();
    } else {
      console.log('❌ FAIL: Error forwarding request\n');
      console.log('   Error:', err.message);
      process.exit(1);
    }
  });
}

function runTest4() {
  // Test 4: CORS Headers
  console.log('Test 4: CORS Headers Check');
  console.log('──────────────────────────');

  const options = {
    hostname: PROXY_HOST,
    port: PROXY_PORT,
    path: '/api/health',
    method: 'OPTIONS',
    agent: agent
  };

  const req = https.request(options, (res) => {
    const hasOrigin = 'access-control-allow-origin' in res.headers;
    const hasMethods = 'access-control-allow-methods' in res.headers;
    const hasHeaders = 'access-control-allow-headers' in res.headers;

    if (hasOrigin && hasMethods && hasHeaders) {
      console.log('✅ PASS: CORS headers present');
      console.log(`   Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`   Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`   Allow-Headers: ${res.headers['access-control-allow-headers']}\n`);
    } else {
      console.log('⚠️  WARNING: Some CORS headers missing\n');
    }
    
    runTest5();
  });

  req.on('error', (err) => {
    console.log('⚠️  WARNING: Could not test CORS headers\n');
    runTest5();
  });

  req.end();
}

function runTest5() {
  // Test 5: POST Request
  console.log('Test 5: POST Request');
  console.log('────────────────────');

  const postData = JSON.stringify({
    test: true,
    timestamp: new Date().toISOString()
  });

  const options = {
    hostname: PROXY_HOST,
    port: PROXY_PORT,
    path: '/api/hardware',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    agent: agent
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log(`✅ PASS: POST request successful (status ${res.statusCode})`);
        if (data) {
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json)}\n`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...\n`);
          }
        } else {
          console.log('   (Empty response)\n');
        }
      } else if (res.statusCode === 502) {
        console.log(`⚠️  WARNING: POST request got 502 (Agent not responding)\n`);
      } else {
        console.log(`❌ FAIL: Unexpected status ${res.statusCode}\n`);
      }
      
      printSummary();
    });
  });

  req.on('error', (err) => {
    console.log('❌ FAIL: POST request error\n');
    printSummary();
  });

  req.write(postData);
  req.end();
}

function printSummary() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Test Summary                        ║');
  console.log('╚══════════════════════════════════════╝\n');
  
  console.log('✅ Proxy is running and responding\n');
  
  console.log('Next Steps:');
  console.log('───────────');
  console.log('1. Make sure Hardware Agent is running:');
  console.log(`   cd C:\\HardwareAgent && YAS.HardwareAgent.exe\n`);
  
  console.log('2. Then test Agent connectivity:');
  console.log('   node test-proxy.js\n');
  
  console.log('3. Use from Vercel:');
  console.log('   fetch("https://127.0.0.1:443/api/hardware", {...})\n');
  
  console.log('4. Additional Resources:');
  console.log('   - README.md: General information');
  console.log('   - SETUP-GUIDE.md: Detailed setup instructions');
  console.log('   - VERCEL-INTEGRATION.md: Code examples\n');
  
  process.exit(0);
}
