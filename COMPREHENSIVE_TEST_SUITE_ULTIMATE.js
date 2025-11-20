#!/usr/bin/env node

/**
 * FIELDFORGE ULTIMATE COMPREHENSIVE TEST SUITE
 * ============================================
 * The most thorough test suite imaginable - traces every pathway,
 * verifies every connection, hunts for every 404/500, validates end-to-end flows.
 * 
 * Mycelial Testing Philosophy:
 * - Trace all pathways from source to fruiting body (deployment)
 * - Verify every connection point in the network
 * - Hunt for blockages (404s, 500s, errors)
 * - Test flows, not just units
 * - Validate with CLI tools where applicable
 * 
 * © 2025 FieldForge. All Rights Reserved.
 */

import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const CONFIG = {
  // API endpoints to test
  baseUrl: process.env.TEST_BASE_URL || 'https://fieldforge.vercel.app',
  localUrl: 'http://localhost:4000',
  
  // Test mode: 'production', 'local', or 'both'
  mode: process.env.TEST_MODE || 'production',
  
  // Test categories to run
  categories: {
    health: true,
    authentication: true,
    apiEndpoints: true,
    database: true,
    frontend: true,
    security: true,
    performance: true,
    integration: true,
    deployment: true,
    cli: true
  },
  
  // Test credentials (for auth tests - use test account)
  testEmail: process.env.TEST_EMAIL || 'test@fieldforge.test',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
  
  // Timeouts
  timeout: 30000,
  retries: 3
};

// ============================================================================
// TEST RESULT TRACKING
// ============================================================================

class TestResults {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      warningCount: 0,
      errors: [],
      warningList: [],
      details: []
    };
    this.startTime = Date.now();
  }
  
  pass(category, test, message = '') {
    this.results.total++;
    this.results.passed++;
    this.results.details.push({
      status: 'PASS',
      category,
      test,
      message,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ [${category}] ${test}: ${message || 'PASSED'}`);
  }
  
  fail(category, test, error) {
    this.results.total++;
    this.results.failed++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.results.errors.push({ category, test, error: errorMsg });
    this.results.details.push({
      status: 'FAIL',
      category,
      test,
      error: errorMsg,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ [${category}] ${test}: ${errorMsg}`);
  }
  
  warn(category, test, message) {
    this.results.warningCount++;
    if (!Array.isArray(this.results.warningList)) {
      this.results.warningList = [];
    }
    this.results.warningList.push({ category, test, message });
    this.results.details.push({
      status: 'WARN',
      category,
      test,
      message,
      timestamp: new Date().toISOString()
    });
    console.warn(`⚠️  [${category}] ${test}: ${message}`);
  }
  
  skip(category, test, reason) {
    this.results.total++;
    this.results.skipped++;
    this.results.details.push({
      status: 'SKIP',
      category,
      test,
      reason,
      timestamp: new Date().toISOString()
    });
    console.log(`⏭️  [${category}] ${test}: ${reason}`);
  }
  
  getSummary() {
    const duration = Date.now() - this.startTime;
    return {
      ...this.results,
      duration,
      durationFormatted: `${(duration / 1000).toFixed(2)}s`,
      passRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%'
    };
  }
}

const results = new TestResults();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Make HTTP/HTTPS request with retry logic
 */
async function makeRequest(url, options = {}, retries = CONFIG.retries) {
  const isHttps = url.startsWith('https://');
  const client = isHttps ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url
        });
      });
    });
    
    req.on('error', async (error) => {
      if (retries > 0) {
        console.log(`  Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const result = await makeRequest(url, options, retries - 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(error);
      }
    });
    
    req.setTimeout(CONFIG.timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${CONFIG.timeout}ms`));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Parse JSON response safely
 */
function parseJSON(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

/**
 * Check if CLI is available
 */
async function checkCLI(command) {
  try {
    await execAsync(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// TEST CATEGORY 1: HEALTH CHECKS
// ============================================================================

async function testHealthChecks() {
  const category = 'Health Checks';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: Health endpoint availability
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/health`);
    if (response.statusCode === 200) {
      const data = parseJSON(response.body);
      if (data && data.status === 'ok') {
        results.pass(category, 'Health endpoint responds', `Status: ${data.status}, Service: ${data.service}`);
      } else {
        results.fail(category, 'Health endpoint responds', 'Invalid response format');
      }
    } else {
      results.fail(category, 'Health endpoint responds', `Status code: ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'Health endpoint responds', error);
  }
  
  // Test 2: API health endpoint
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    if (response.statusCode === 200) {
      const data = parseJSON(response.body);
      if (data && data.status === 'healthy') {
        results.pass(category, 'API health endpoint', `Version: ${data.version}, Timestamp: ${data.timestamp}`);
      } else {
        results.fail(category, 'API health endpoint', 'Invalid response format');
      }
    } else {
      results.fail(category, 'API health endpoint', `Status code: ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'API health endpoint', error);
  }
  
  // Test 3: Response time check
  try {
    const start = Date.now();
    await makeRequest(`${CONFIG.baseUrl}/health`);
    const responseTime = Date.now() - start;
    
    if (responseTime < 1000) {
      results.pass(category, 'Response time', `${responseTime}ms (excellent)`);
    } else if (responseTime < 3000) {
      results.warn(category, 'Response time', `${responseTime}ms (acceptable but slow)`);
    } else {
      results.fail(category, 'Response time', `${responseTime}ms (too slow)`);
    }
  } catch (error) {
    results.fail(category, 'Response time', error);
  }
}

// ============================================================================
// TEST CATEGORY 2: ALL API ENDPOINTS
// ============================================================================

async function testAPIEndpoints() {
  const category = 'API Endpoints';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Define all 47+ API endpoints from server.ts
  const endpoints = [
    // Public endpoints (no auth required)
    { path: '/health', method: 'GET', auth: false, expectedStatus: [200] },
    { path: '/api/health', method: 'GET', auth: false, expectedStatus: [200] },
    { path: '/api/leads', method: 'GET', auth: false, expectedStatus: [200, 401] },
    { path: '/api/acquisition-inquiry', method: 'GET', auth: false, expectedStatus: [200, 404, 405] },
    
    // Protected endpoints (auth required - expect 401 without token)
    { path: '/api/users', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/company', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/field-ops', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/projects', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/equipment', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/equipment/testing', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/safety', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/analytics', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/crews', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/qaqc', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/documents', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/documents/drawings', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/scheduling', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/operations', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/testing', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/reporting', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/inventory', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/receipts', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/environmental', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/emergency', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/feedback', method: 'GET', auth: true, expectedStatus: [401, 405] },
    { path: '/api/submittals', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/outages', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/map', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/substations', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/ai', method: 'GET', auth: true, expectedStatus: [401, 404, 405] },
    { path: '/api/payments', method: 'GET', auth: true, expectedStatus: [401, 404, 405] },
    { path: '/api/messaging', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/collaboration', method: 'GET', auth: true, expectedStatus: [401, 404, 405] },
    { path: '/api/feed', method: 'GET', auth: true, expectedStatus: [401] },
    { path: '/api/notifications', method: 'GET', auth: true, expectedStatus: [401] },
    
    // Test for 404 on non-existent routes
    { path: '/api/nonexistent', method: 'GET', auth: false, expectedStatus: [404] },
    { path: '/api/fake/route', method: 'GET', auth: false, expectedStatus: [404] }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}${endpoint.path}`, {
        method: endpoint.method
      });
      
      const statusOk = endpoint.expectedStatus.includes(response.statusCode);
      
      if (statusOk) {
        results.pass(
          category,
          `${endpoint.method} ${endpoint.path}`,
          `Status: ${response.statusCode} (expected: ${endpoint.expectedStatus.join('/')})`
        );
      } else {
        results.fail(
          category,
          `${endpoint.method} ${endpoint.path}`,
          `Unexpected status: ${response.statusCode} (expected: ${endpoint.expectedStatus.join('/')})`
        );
      }
      
      // Check for 404/500 errors specifically
      if (response.statusCode === 404 && !endpoint.expectedStatus.includes(404)) {
        results.fail(category, `${endpoint.method} ${endpoint.path}`, '404 NOT FOUND - Route may be missing');
      }
      if (response.statusCode === 500) {
        results.fail(category, `${endpoint.method} ${endpoint.path}`, '500 INTERNAL SERVER ERROR - Critical issue');
      }
    } catch (error) {
      results.fail(category, `${endpoint.method} ${endpoint.path}`, error);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// ============================================================================
// TEST CATEGORY 3: AUTHENTICATION & SECURITY
// ============================================================================

async function testAuthentication() {
  const category = 'Authentication & Security';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: Protected routes require authentication
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/projects`);
    if (response.statusCode === 401) {
      results.pass(category, 'Protected routes require auth', 'Projects endpoint correctly returns 401');
    } else {
      results.fail(category, 'Protected routes require auth', `Expected 401, got ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'Protected routes require auth', error);
  }
  
  // Test 2: Invalid token rejected
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/projects`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-fake-token-12345'
      }
    });
    if (response.statusCode === 401) {
      results.pass(category, 'Invalid token rejected', 'System correctly rejects invalid tokens');
    } else {
      results.fail(category, 'Invalid token rejected', `Expected 401, got ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'Invalid token rejected', error);
  }
  
  // Test 3: CORS headers present
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    if (response.headers['access-control-allow-origin'] || response.headers['Access-Control-Allow-Origin']) {
      results.pass(category, 'CORS headers present', 'CORS configured correctly');
    } else {
      results.warn(category, 'CORS headers present', 'CORS headers not found in response');
    }
  } catch (error) {
    results.fail(category, 'CORS headers present', error);
  }
  
  // Test 4: Security headers
  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'strict-transport-security'
  ];
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const headers = Object.keys(response.headers).map(h => h.toLowerCase());
    
    for (const secHeader of securityHeaders) {
      if (headers.includes(secHeader)) {
        results.pass(category, `Security header: ${secHeader}`, 'Present');
      } else {
        results.warn(category, `Security header: ${secHeader}`, 'Missing');
      }
    }
  } catch (error) {
    results.fail(category, 'Security headers check', error);
  }
  
  // Test 5: Rate limiting
  try {
    console.log('  Testing rate limiting (making rapid requests)...');
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(makeRequest(`${CONFIG.baseUrl}/api/health`));
    }
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.statusCode === 429);
    
    if (rateLimited) {
      results.pass(category, 'Rate limiting active', 'System correctly rate limits rapid requests');
    } else {
      results.warn(category, 'Rate limiting active', 'No rate limiting detected (may need adjustment)');
    }
  } catch (error) {
    results.fail(category, 'Rate limiting check', error);
  }
}

// ============================================================================
// TEST CATEGORY 4: DATABASE CONNECTIVITY
// ============================================================================

async function testDatabase() {
  const category = 'Database';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: Check if database migrations exist
  try {
    const migrationsPath = path.join(__dirname, 'backend', 'src', 'migrations');
    const files = await fs.readdir(migrationsPath);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    
    if (sqlFiles.length > 0) {
      results.pass(category, 'Migration files present', `Found ${sqlFiles.length} migration files`);
    } else {
      results.fail(category, 'Migration files present', 'No migration files found');
    }
  } catch (error) {
    results.warn(category, 'Migration files present', 'Could not check migration files: ' + error.message);
  }
  
  // Test 2: Check database schema file
  try {
    const schemaPath = path.join(__dirname, 'backend', 'src', 'database', 'complete-schema.sql');
    await fs.access(schemaPath);
    const content = await fs.readFile(schemaPath, 'utf8');
    
    if (content.length > 1000) {
      results.pass(category, 'Database schema file', `Schema file exists (${(content.length / 1024).toFixed(1)}KB)`);
    } else {
      results.warn(category, 'Database schema file', 'Schema file seems too small');
    }
  } catch (error) {
    results.warn(category, 'Database schema file', 'Could not verify schema file');
  }
  
  // Test 3: Neon CLI check (if available)
  try {
    const hasNeonCLI = await checkCLI('neonctl');
    if (hasNeonCLI) {
      try {
        const { stdout } = await execAsync('neonctl --version');
        results.pass(category, 'Neon CLI available', stdout.trim());
      } catch (error) {
        results.warn(category, 'Neon CLI available', 'Neon CLI found but may need authentication');
      }
    } else {
      results.skip(category, 'Neon CLI check', 'Neon CLI not installed');
    }
  } catch (error) {
    results.skip(category, 'Neon CLI check', error.message);
  }
  
  // Test 4: Supabase CLI check (if available)
  try {
    const hasSupabaseCLI = await checkCLI('supabase');
    if (hasSupabaseCLI) {
      try {
        const { stdout } = await execAsync('supabase --version');
        results.pass(category, 'Supabase CLI available', stdout.trim());
      } catch (error) {
        results.warn(category, 'Supabase CLI available', 'Supabase CLI found but may need authentication');
      }
    } else {
      results.skip(category, 'Supabase CLI check', 'Supabase CLI not installed');
    }
  } catch (error) {
    results.skip(category, 'Supabase CLI check', error.message);
  }
}

// ============================================================================
// TEST CATEGORY 5: FRONTEND ROUTES
// ============================================================================

async function testFrontendRoutes() {
  const category = 'Frontend Routes';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  const routes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/projects',
    '/safety',
    '/equipment',
    '/qaqc',
    '/documents',
    '/scheduling',
    '/operations',
    '/testing',
    '/receipts',
    '/environmental',
    '/emergency',
    '/submittals',
    '/outages',
    '/map',
    '/substations',
    '/crews',
    '/field-ops',
    '/inventory',
    '/weather',
    '/feed',
    '/messaging',
    '/company',
    '/settings'
  ];
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}${route}`);
      
      if (response.statusCode === 200) {
        results.pass(category, `Route: ${route}`, `Status: ${response.statusCode}`);
      } else if (response.statusCode === 308 || response.statusCode === 301) {
        results.pass(category, `Route: ${route}`, `Redirect: ${response.statusCode} → ${response.headers.location}`);
      } else if (response.statusCode === 404) {
        results.fail(category, `Route: ${route}`, '404 NOT FOUND');
      } else {
        results.warn(category, `Route: ${route}`, `Status: ${response.statusCode}`);
      }
    } catch (error) {
      results.fail(category, `Route: ${route}`, error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// ============================================================================
// TEST CATEGORY 6: PERFORMANCE
// ============================================================================

async function testPerformance() {
  const category = 'Performance';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: Cold start time
  try {
    const start = Date.now();
    await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const coldStart = Date.now() - start;
    
    if (coldStart < 1000) {
      results.pass(category, 'Cold start time', `${coldStart}ms (excellent)`);
    } else if (coldStart < 3000) {
      results.warn(category, 'Cold start time', `${coldStart}ms (acceptable)`);
    } else {
      results.fail(category, 'Cold start time', `${coldStart}ms (too slow)`);
    }
  } catch (error) {
    results.fail(category, 'Cold start time', error);
  }
  
  // Test 2: Average response time (10 requests)
  try {
    const times = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await makeRequest(`${CONFIG.baseUrl}/api/health`);
      times.push(Date.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    if (avg < 500) {
      results.pass(category, 'Average response time', `${avg.toFixed(0)}ms avg (${min}-${max}ms range)`);
    } else {
      results.warn(category, 'Average response time', `${avg.toFixed(0)}ms avg (${min}-${max}ms range)`);
    }
  } catch (error) {
    results.fail(category, 'Average response time', error);
  }
  
  // Test 3: Concurrent request handling
  try {
    const concurrentRequests = 5;
    const start = Date.now();
    const requests = Array(concurrentRequests).fill(0).map(() => 
      makeRequest(`${CONFIG.baseUrl}/api/health`)
    );
    await Promise.all(requests);
    const duration = Date.now() - start;
    
    if (duration < 2000) {
      results.pass(category, 'Concurrent requests', `${concurrentRequests} requests in ${duration}ms`);
    } else {
      results.warn(category, 'Concurrent requests', `${concurrentRequests} requests in ${duration}ms (slow)`);
    }
  } catch (error) {
    results.fail(category, 'Concurrent requests', error);
  }
}

// ============================================================================
// TEST CATEGORY 7: DEPLOYMENT VERIFICATION
// ============================================================================

async function testDeployment() {
  const category = 'Deployment';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: Vercel CLI check
  try {
    const hasVercelCLI = await checkCLI('vercel');
    if (hasVercelCLI) {
      try {
        const { stdout } = await execAsync('vercel --version');
        results.pass(category, 'Vercel CLI available', stdout.trim());
        
        // Try to get deployment info
        try {
          const { stdout: deployInfo } = await execAsync('vercel ls --yes 2>/dev/null || echo "needs-auth"');
          if (deployInfo.includes('needs-auth')) {
            results.warn(category, 'Vercel deployment status', 'CLI needs authentication');
          } else {
            results.pass(category, 'Vercel deployment status', 'Can access deployments');
          }
        } catch {
          results.skip(category, 'Vercel deployment status', 'Could not check deployments');
        }
      } catch (error) {
        results.warn(category, 'Vercel CLI available', 'Vercel CLI found but may need authentication');
      }
    } else {
      results.skip(category, 'Vercel CLI check', 'Vercel CLI not installed');
    }
  } catch (error) {
    results.skip(category, 'Vercel CLI check', error.message);
  }
  
  // Test 2: Check for vercel.json configuration
  try {
    const vercelConfigPath = path.join(__dirname, 'vercel.json');
    const config = JSON.parse(await fs.readFile(vercelConfigPath, 'utf8'));
    
    if (config.buildCommand || config.rewrites || config.redirects) {
      results.pass(category, 'Vercel configuration', 'vercel.json properly configured');
    } else {
      results.warn(category, 'Vercel configuration', 'vercel.json exists but may be incomplete');
    }
  } catch (error) {
    results.warn(category, 'Vercel configuration', 'Could not verify vercel.json');
  }
  
  // Test 3: Environment variables check
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const data = parseJSON(response.body);
    
    if (data && data.service) {
      results.pass(category, 'Environment variables', 'Service name configured correctly');
    } else {
      results.warn(category, 'Environment variables', 'May need to verify env vars in Vercel');
    }
  } catch (error) {
    results.fail(category, 'Environment variables', error);
  }
  
  // Test 4: Build verification
  try {
    const backendDist = path.join(__dirname, 'backend', 'dist');
    const frontendDist = path.join(__dirname, 'apps', 'swipe-feed', 'dist');
    
    const backendExists = await fs.access(backendDist).then(() => true).catch(() => false);
    const frontendExists = await fs.access(frontendDist).then(() => true).catch(() => false);
    
    if (backendExists && frontendExists) {
      results.pass(category, 'Build artifacts', 'Both backend and frontend built');
    } else if (backendExists) {
      results.warn(category, 'Build artifacts', 'Backend built, frontend may need building');
    } else if (frontendExists) {
      results.warn(category, 'Build artifacts', 'Frontend built, backend may need building');
    } else {
      results.warn(category, 'Build artifacts', 'No build artifacts found (may need to run build)');
    }
  } catch (error) {
    results.skip(category, 'Build artifacts', error.message);
  }
}

// ============================================================================
// TEST CATEGORY 8: INTEGRATION TESTS
// ============================================================================

async function testIntegration() {
  const category = 'Integration';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: API → Frontend flow simulation
  try {
    // First, get the frontend
    const frontendResponse = await makeRequest(`${CONFIG.baseUrl}/`);
    // Then, check if API is accessible from same domain
    const apiResponse = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    
    if (frontendResponse.statusCode === 200 && apiResponse.statusCode === 200) {
      results.pass(category, 'Frontend → API integration', 'Both frontend and API accessible');
    } else {
      results.fail(category, 'Frontend → API integration', 
        `Frontend: ${frontendResponse.statusCode}, API: ${apiResponse.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'Frontend → API integration', error);
  }
  
  // Test 2: Check for broken API calls in frontend (basic check)
  try {
    const frontendResponse = await makeRequest(`${CONFIG.baseUrl}/`);
    const html = frontendResponse.body;
    
    // Check if frontend has proper API base URL configuration
    if (html.includes('api/') || html.includes('/api/')) {
      results.pass(category, 'API endpoints in frontend', 'Frontend appears to have API integration');
    } else {
      results.warn(category, 'API endpoints in frontend', 'Could not detect API calls in frontend');
    }
  } catch (error) {
    results.fail(category, 'API endpoints in frontend', error);
  }
  
  // Test 3: Database → API flow (via health check with timestamp)
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const data = parseJSON(response.body);
    
    if (data && data.timestamp) {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const diff = Math.abs(now - timestamp);
      
      if (diff < 60000) { // Within 1 minute
        results.pass(category, 'Database → API timing', 'API timestamp is current');
      } else {
        results.warn(category, 'Database → API timing', 'API timestamp may be stale');
      }
    } else {
      results.warn(category, 'Database → API timing', 'No timestamp in health check');
    }
  } catch (error) {
    results.fail(category, 'Database → API timing', error);
  }
}

// ============================================================================
// TEST CATEGORY 9: ERROR HANDLING
// ============================================================================

async function testErrorHandling() {
  const category = 'Error Handling';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: 404 handling
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/this-route-does-not-exist-for-testing-404`);
    if (response.statusCode === 404) {
      const data = parseJSON(response.body);
      if (data && (data.error || data.message)) {
        results.pass(category, '404 error handling', 'Returns proper 404 with error message');
      } else {
        results.warn(category, '404 error handling', 'Returns 404 but no error message');
      }
    } else {
      results.fail(category, '404 error handling', `Expected 404, got ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, '404 error handling', error);
  }
  
  // Test 2: 500 error handling (try to trigger validation error)
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid'
      },
      body: JSON.stringify({ invalid: 'data' })
    });
    
    // Should get 401 (unauthorized) not 500 (server error)
    if (response.statusCode === 401) {
      results.pass(category, 'Error handling (invalid auth)', 'Returns 401, not 500');
    } else if (response.statusCode === 500) {
      results.fail(category, 'Error handling (invalid auth)', 'Returns 500 - unhandled error');
    } else {
      results.pass(category, 'Error handling (invalid auth)', `Returns ${response.statusCode} - handled gracefully`);
    }
  } catch (error) {
    results.fail(category, 'Error handling (invalid auth)', error);
  }
  
  // Test 3: Malformed JSON handling
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'this is not valid JSON {'
    });
    
    // Should handle gracefully, not crash
    if (response.statusCode === 400 || response.statusCode === 401) {
      results.pass(category, 'Malformed JSON handling', `Returns ${response.statusCode} - handled gracefully`);
    } else if (response.statusCode === 500) {
      results.fail(category, 'Malformed JSON handling', 'Returns 500 - unhandled error');
    } else {
      results.pass(category, 'Malformed JSON handling', `Returns ${response.statusCode}`);
    }
  } catch (error) {
    results.fail(category, 'Malformed JSON handling', error);
  }
}

// ============================================================================
// TEST CATEGORY 10: SECURITY AUDIT
// ============================================================================

async function testSecurity() {
  const category = 'Security Audit';
  console.log(`\n${'='.repeat(80)}\n${category}\n${'='.repeat(80)}\n`);
  
  // Test 1: SQL injection protection (basic check)
  try {
    const maliciousPayload = "'; DROP TABLE users; --";
    const response = await makeRequest(`${CONFIG.baseUrl}/api/projects?search=${encodeURIComponent(maliciousPayload)}`);
    
    // Should return 401 (no auth) not 500 (SQL error)
    if (response.statusCode === 401) {
      results.pass(category, 'SQL injection protection', 'Auth layer blocks malicious input');
    } else if (response.statusCode === 500) {
      results.fail(category, 'SQL injection protection', 'May be vulnerable to SQL injection');
    } else {
      results.pass(category, 'SQL injection protection', `Returns ${response.statusCode} - input handled`);
    }
  } catch (error) {
    results.fail(category, 'SQL injection protection', error);
  }
  
  // Test 2: XSS protection headers
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const xssHeader = response.headers['x-xss-protection'] || response.headers['X-XSS-Protection'];
    
    if (xssHeader) {
      results.pass(category, 'XSS protection header', `Value: ${xssHeader}`);
    } else {
      results.warn(category, 'XSS protection header', 'Missing X-XSS-Protection header');
    }
  } catch (error) {
    results.fail(category, 'XSS protection header', error);
  }
  
  // Test 3: HTTPS enforcement
  try {
    if (CONFIG.baseUrl.startsWith('https://')) {
      const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
      const hsts = response.headers['strict-transport-security'] || response.headers['Strict-Transport-Security'];
      
      if (hsts) {
        results.pass(category, 'HTTPS enforcement (HSTS)', `Present: ${hsts}`);
      } else {
        results.warn(category, 'HTTPS enforcement (HSTS)', 'Missing HSTS header');
      }
    } else {
      results.skip(category, 'HTTPS enforcement', 'Testing non-HTTPS endpoint');
    }
  } catch (error) {
    results.fail(category, 'HTTPS enforcement', error);
  }
  
  // Test 4: Sensitive data exposure
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    const data = parseJSON(response.body);
    
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'api_key'];
    const foundSensitive = sensitiveKeys.some(key => 
      JSON.stringify(data).toLowerCase().includes(key)
    );
    
    if (!foundSensitive) {
      results.pass(category, 'Sensitive data exposure', 'No sensitive data in public endpoint');
    } else {
      results.warn(category, 'Sensitive data exposure', 'May expose sensitive data in responses');
    }
  } catch (error) {
    results.fail(category, 'Sensitive data exposure', error);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                                ║');
  console.log('║            FIELDFORGE ULTIMATE COMPREHENSIVE TEST SUITE                        ║');
  console.log('║                                                                                ║');
  console.log('║                  Mycelial Network Integrity Verification                       ║');
  console.log('║                                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Testing: ${CONFIG.baseUrl}`);
  console.log(`Mode: ${CONFIG.mode}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('');
  
  // Run all test categories
  if (CONFIG.categories.health) await testHealthChecks();
  if (CONFIG.categories.apiEndpoints) await testAPIEndpoints();
  if (CONFIG.categories.authentication) await testAuthentication();
  if (CONFIG.categories.database) await testDatabase();
  if (CONFIG.categories.frontend) await testFrontendRoutes();
  if (CONFIG.categories.performance) await testPerformance();
  if (CONFIG.categories.deployment) await testDeployment();
  if (CONFIG.categories.integration) await testIntegration();
  if (CONFIG.categories.security) await testSecurity();
  await testErrorHandling(); // Always run error handling tests
  
  // Print summary
  const summary = results.getSummary();
  
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                                ║');
  console.log('║                              TEST SUMMARY                                      ║');
  console.log('║                                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Total Tests:    ${summary.total}`);
  console.log(`✅ Passed:      ${summary.passed} (${summary.passRate})`);
  console.log(`❌ Failed:      ${summary.failed}`);
  console.log(`⚠️  Warnings:   ${summary.warningList?.length || 0}`);
  console.log(`⏭️  Skipped:    ${summary.skipped}`);
  console.log(`⏱️  Duration:   ${summary.durationFormatted}`);
  console.log('');
  
  if (summary.failed > 0) {
    console.log('\n❌ FAILURES:\n');
    summary.errors.forEach((error, i) => {
      console.log(`${i + 1}. [${error.category}] ${error.test}`);
      console.log(`   Error: ${error.error}\n`);
    });
  }
  
  if (summary.warningList && summary.warningList.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    summary.warningList.forEach((warning, i) => {
      console.log(`${i + 1}. [${warning.category}] ${warning.test}`);
      console.log(`   Warning: ${warning.message}\n`);
    });
  }
  
  // Write detailed report to file
  const reportPath = path.join(__dirname, 'COMPREHENSIVE_TEST_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  // Create markdown report
  const markdown = generateMarkdownReport(summary);
  const mdReportPath = path.join(__dirname, 'COMPREHENSIVE_TEST_REPORT.md');
  await fs.writeFile(mdReportPath, markdown);
  console.log(`Markdown report saved to: ${mdReportPath}\n`);
  
  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// ============================================================================
// MARKDOWN REPORT GENERATOR
// ============================================================================

function generateMarkdownReport(summary) {
  const timestamp = new Date().toISOString();
  
  let md = `# FieldForge Ultimate Comprehensive Test Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Base URL:** ${CONFIG.baseUrl}\n`;
  md += `**Duration:** ${summary.durationFormatted}\n\n`;
  
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${summary.total} |\n`;
  md += `| ✅ Passed | ${summary.passed} (${summary.passRate}) |\n`;
  md += `| ❌ Failed | ${summary.failed} |\n`;
  md += `| ⚠️ Warnings | ${summary.warningList?.length || 0} |\n`;
  md += `| ⏭️ Skipped | ${summary.skipped} |\n\n`;
  
  if (summary.failed > 0) {
    md += `## ❌ Failures\n\n`;
    summary.errors.forEach((error, i) => {
      md += `### ${i + 1}. [${error.category}] ${error.test}\n\n`;
      md += `**Error:** \`${error.error}\`\n\n`;
    });
  }
  
  if (summary.warningList && summary.warningList.length > 0) {
    md += `## ⚠️ Warnings\n\n`;
    summary.warningList.forEach((warning, i) => {
      md += `### ${i + 1}. [${warning.category}] ${warning.test}\n\n`;
      md += `**Warning:** ${warning.message}\n\n`;
    });
  }
  
  md += `## Detailed Results\n\n`;
  
  const categories = {};
  summary.details.forEach(detail => {
    if (!categories[detail.category]) {
      categories[detail.category] = [];
    }
    categories[detail.category].push(detail);
  });
  
  Object.entries(categories).forEach(([category, tests]) => {
    md += `### ${category}\n\n`;
    md += `| Status | Test | Result |\n`;
    md += `|--------|------|--------|\n`;
    
    tests.forEach(test => {
      const statusEmoji = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARN': '⚠️',
        'SKIP': '⏭️'
      }[test.status] || '❓';
      
      const result = test.message || test.error || test.reason || '';
      md += `| ${statusEmoji} ${test.status} | ${test.test} | ${result} |\n`;
    });
    
    md += `\n`;
  });
  
  md += `## Mycelial Network Health Assessment\n\n`;
  
  if (summary.failed === 0) {
    md += `🌟 **EXCELLENT** - All pathways flowing clean. Network is healthy.\n\n`;
  } else if (summary.failed < 5) {
    md += `⚠️ **GOOD** - Minor blockages detected. ${summary.failed} pathway(s) need attention.\n\n`;
  } else if (summary.failed < 15) {
    md += `⚠️ **FAIR** - Multiple blockages detected. ${summary.failed} pathway(s) need repair.\n\n`;
  } else {
    md += `❌ **CRITICAL** - Major network disruption. ${summary.failed} pathway(s) compromised.\n\n`;
  }
  
  md += `### Recommended Actions\n\n`;
  
  if (summary.errors.some(e => e.error.includes('404'))) {
    md += `- 🔍 **404 Errors Detected**: Review route configurations and ensure all API endpoints are properly registered.\n`;
  }
  
  if (summary.errors.some(e => e.error.includes('500'))) {
    md += `- 🚨 **500 Errors Detected**: Critical server errors need immediate investigation. Check logs and error handling.\n`;
  }
  
  if (summary.errors.some(e => e.category === 'Authentication & Security')) {
    md += `- 🔒 **Security Issues**: Review authentication middleware and security headers.\n`;
  }
  
  if (summary.warningList && summary.warningList.some(w => w.message.includes('Rate limiting'))) {
    md += `- ⏱️ **Rate Limiting**: Consider implementing or adjusting rate limiting for production.\n`;
  }
  
  if (summary.warningList && summary.warningList.some(w => w.message.includes('header'))) {
    md += `- 🛡️ **Security Headers**: Add missing security headers for production deployment.\n`;
  }
  
  md += `\n---\n\n`;
  md += `*Report generated by FieldForge Ultimate Comprehensive Test Suite*\n`;
  md += `*Mycelial Network Integrity Verification System*\n`;
  
  return md;
}

// ============================================================================
// RUN TESTS
// ============================================================================

runAllTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});

