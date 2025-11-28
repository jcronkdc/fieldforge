/**
 * FIELDFORGE COMPREHENSIVE SMOKE TEST
 * The Consciousness Tests Every Neural Pathway
 * 
 * This smoke test simulates a complete user journey through the platform,
 * testing every feature, every connection, every interaction.
 */

import { supabase } from '../lib/supabase';

// Test configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TEST_TIMEOUT = 5000;

// Test results tracking
interface TestResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
}

const testResults: TestResult[] = [];

// Utility functions
function logTest(category: string, test: string, status: 'pass' | 'fail' | 'skip', error?: string) {
  const result: TestResult = { category, test, status, error };
  testResults.push(result);
  
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${emoji} ${category}: ${test}${error ? ` - ${error}` : ''}`);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. LANDING & ONBOARDING TESTS
async function testLandingOnboarding() {
  const category = 'Landing & Onboarding';
  
  try {
    // Test landing page load
    const landingResponse = await fetch('/');
    logTest(category, 'Landing page loads', landingResponse.ok ? 'pass' : 'fail');
    
    // Test pricing page
    const pricingResponse = await fetch('/pricing');
    logTest(category, 'Pricing page accessible', pricingResponse.ok ? 'pass' : 'fail');
    
    // Test contact form API
    const leadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Construction Co',
      message: 'Testing lead capture'
    };
    
    const leadResponse = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    
    logTest(category, 'Contact form submission', leadResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Landing tests', 'fail', error.message);
  }
}

// 2. AUTHENTICATION TESTS
async function testAuthentication() {
  const category = 'Authentication';
  
  try {
    // Test signup
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: `test${Date.now()}@fieldforge.com`,
      password: 'TestPassword123!'
    });
    
    logTest(category, 'User signup', signupError ? 'fail' : 'pass', signupError?.message);
    
    // Test login with demo account
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'demo@fieldforge.com',
      password: 'demo123'
    });
    
    logTest(category, 'Demo login', loginError ? 'fail' : 'pass', loginError?.message);
    
    // Test session persistence
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    logTest(category, 'Session persistence', sessionData?.session ? 'pass' : 'fail');
    
    // Test logout
    const { error: logoutError } = await supabase.auth.signOut();
    logTest(category, 'Logout functionality', logoutError ? 'fail' : 'pass', logoutError?.message);
    
  } catch (error: any) {
    logTest(category, 'Authentication tests', 'fail', error.message);
  }
}

// 3. DASHBOARD & ANALYTICS TESTS
async function testDashboardAnalytics(authToken: string) {
  const category = 'Dashboard & Analytics';
  
  try {
    // Test project metrics API
    const metricsResponse = await fetch(`${API_URL}/analytics/projects`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Project metrics API', metricsResponse.ok ? 'pass' : 'fail');
    
    // Test safety metrics API
    const safetyResponse = await fetch(`${API_URL}/analytics/safety`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Safety metrics API', safetyResponse.ok ? 'pass' : 'fail');
    
    // Test data export
    const exportResponse = await fetch(`${API_URL}/analytics/export?format=csv`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Data export functionality', exportResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Dashboard tests', 'fail', error.message);
  }
}

// 4. FIELD OPERATIONS TESTS
async function testFieldOperations(authToken: string) {
  const category = 'Field Operations';
  
  try {
    // Test daily operations
    const dailyOpsResponse = await fetch(`${API_URL}/field-ops/daily`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Daily operations load', dailyOpsResponse.ok ? 'pass' : 'fail');
    
    // Test time tracking
    const timeEntry = {
      start_time: new Date().toISOString(),
      project_id: 'test-project',
      task_description: 'Smoke test task'
    };
    
    const timeResponse = await fetch(`${API_URL}/field-ops/time`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(timeEntry)
    });
    
    logTest(category, 'Time tracking entry', timeResponse.ok ? 'pass' : 'fail');
    
    // Test weather API
    const weatherResponse = await fetch(`${API_URL}/field-ops/weather`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Weather data fetch', weatherResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Field operations tests', 'fail', error.message);
  }
}

// 5. SAFETY MANAGEMENT TESTS
async function testSafetyManagement(authToken: string) {
  const category = 'Safety Management';
  
  try {
    // Test safety hub
    const safetyHubResponse = await fetch(`${API_URL}/safety/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Safety hub loads', safetyHubResponse.ok ? 'pass' : 'fail');
    
    // Test incident creation
    const incident = {
      type: 'near_miss',
      description: 'Test incident for smoke test',
      severity: 'low',
      location: 'Test Site'
    };
    
    const incidentResponse = await fetch(`${API_URL}/safety/incidents`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incident)
    });
    
    logTest(category, 'Incident reporting', incidentResponse.ok ? 'pass' : 'fail');
    
    // Test permit management
    const permitResponse = await fetch(`${API_URL}/safety/permits`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Permit management', permitResponse.ok ? 'pass' : 'fail');
    
    // Test emergency alerts
    const emergencyResponse = await fetch(`${API_URL}/emergency/alerts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Emergency alerts system', emergencyResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Safety management tests', 'fail', error.message);
  }
}

// 6. EQUIPMENT & MATERIALS TESTS
async function testEquipmentMaterials(authToken: string) {
  const category = 'Equipment & Materials';
  
  try {
    // Test equipment list
    const equipmentResponse = await fetch(`${API_URL}/equipment`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Equipment list loads', equipmentResponse.ok ? 'pass' : 'fail');
    
    // Test maintenance scheduling
    const maintenance = {
      equipment_id: 'test-equipment',
      maintenance_type: 'preventive',
      scheduled_date: new Date().toISOString()
    };
    
    const maintenanceResponse = await fetch(`${API_URL}/equipment/maintenance`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(maintenance)
    });
    
    logTest(category, 'Maintenance scheduling', maintenanceResponse.ok ? 'pass' : 'fail');
    
    // Test inventory
    const inventoryResponse = await fetch(`${API_URL}/inventory`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Material inventory', inventoryResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Equipment tests', 'fail', error.message);
  }
}

// 7. DOCUMENTATION TESTS
async function testDocumentation(authToken: string) {
  const category = 'Documentation';
  
  try {
    // Test document list
    const docsResponse = await fetch(`${API_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Document hub loads', docsResponse.ok ? 'pass' : 'fail');
    
    // Test drawing viewer
    const drawingsResponse = await fetch(`${API_URL}/documents/drawings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Drawing viewer API', drawingsResponse.ok ? 'pass' : 'fail');
    
    // Test search
    const searchResponse = await fetch(`${API_URL}/documents/search?q=test`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Document search', searchResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Documentation tests', 'fail', error.message);
  }
}

// 8. PROJECT MANAGEMENT TESTS
async function testProjectManagement(authToken: string) {
  const category = 'Project Management';
  
  try {
    // Test project list
    const projectsResponse = await fetch(`${API_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Project list loads', projectsResponse.ok ? 'pass' : 'fail');
    
    // Test schedule
    const scheduleResponse = await fetch(`${API_URL}/projects/schedule`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Schedule Gantt chart', scheduleResponse.ok ? 'pass' : 'fail');
    
    // Test 3-week lookahead
    const lookaheadResponse = await fetch(`${API_URL}/projects/lookahead`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, '3-week lookahead', lookaheadResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Project management tests', 'fail', error.message);
  }
}

// 9. COMMUNICATION TESTS
async function testCommunication(authToken: string) {
  const category = 'Communication';
  
  try {
    // Test messaging channels
    const channelsResponse = await fetch(`${API_URL}/messages/channels`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Messaging channels', channelsResponse.ok ? 'pass' : 'fail');
    
    // Test message sending
    const message = {
      channel_id: 'general',
      content: 'Smoke test message',
      type: 'text'
    };
    
    const messageResponse = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    logTest(category, 'Message sending', messageResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Communication tests', 'fail', error.message);
  }
}

// 10. 3D VISUALIZATION TESTS
async function test3DVisualization(authToken: string) {
  const category = '3D Visualization';
  
  try {
    // Test map data
    const mapResponse = await fetch(`${API_URL}/map`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Project map data', mapResponse.ok ? 'pass' : 'fail');
    
    // Test equipment positions
    const equipmentPosResponse = await fetch(`${API_URL}/map/equipment`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Equipment positions', equipmentPosResponse.ok ? 'pass' : 'fail');
    
    // Test substation model
    const substationResponse = await fetch(`${API_URL}/substations/test-substation`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Substation model data', substationResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, '3D visualization tests', 'fail', error.message);
  }
}

// 11. AI ASSISTANT TESTS
async function testAIAssistant(authToken: string) {
  const category = 'AI Assistant';
  
  try {
    // Test AI chat
    const chatQuery = {
      content: 'What are the current safety concerns?',
      context: { category: 'safety' }
    };
    
    const chatResponse = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatQuery)
    });
    
    logTest(category, 'AI chat functionality', chatResponse.ok ? 'pass' : 'fail');
    
    // Test AI insights
    const insightsResponse = await fetch(`${API_URL}/ai/insights/test-project`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'AI insights generation', insightsResponse.ok ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'AI assistant tests', 'fail', error.message);
  }
}

// 12. SETTINGS & ADMIN TESTS
async function testSettingsAdmin(authToken: string) {
  const category = 'Settings & Admin';
  
  try {
    // Test user profile
    const profileResponse = await fetch(`${API_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'User profile loads', profileResponse.ok ? 'pass' : 'fail');
    
    // Test settings
    const settingsResponse = await fetch(`${API_URL}/users/settings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'User settings API', settingsResponse.ok ? 'pass' : 'fail');
    
    // Test company settings (admin only)
    const companyResponse = await fetch(`${API_URL}/company/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logTest(category, 'Company settings', companyResponse.status === 200 || companyResponse.status === 403 ? 'pass' : 'fail');
    
  } catch (error: any) {
    logTest(category, 'Settings tests', 'fail', error.message);
  }
}

// Main smoke test runner
export async function runSmokeTest() {
  console.log('🍄⚛️ FIELDFORGE COMPREHENSIVE SMOKE TEST');
  console.log('=====================================');
  console.log('Testing every neural pathway in the mycelial network...\n');
  
  const startTime = Date.now();
  
  // Run landing tests (no auth required)
  await testLandingOnboarding();
  await delay(1000);
  
  // Run authentication tests
  await testAuthentication();
  await delay(1000);
  
  // Login for authenticated tests
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'demo@fieldforge.com',
    password: 'demo123'
  });
  
  if (authData?.session?.access_token) {
    const token = authData.session.access_token;
    
    // Run all authenticated tests
    await testDashboardAnalytics(token);
    await delay(1000);
    
    await testFieldOperations(token);
    await delay(1000);
    
    await testSafetyManagement(token);
    await delay(1000);
    
    await testEquipmentMaterials(token);
    await delay(1000);
    
    await testDocumentation(token);
    await delay(1000);
    
    await testProjectManagement(token);
    await delay(1000);
    
    await testCommunication(token);
    await delay(1000);
    
    await test3DVisualization(token);
    await delay(1000);
    
    await testAIAssistant(token);
    await delay(1000);
    
    await testSettingsAdmin(token);
  } else {
    console.error('❌ Authentication failed - cannot run authenticated tests');
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate summary
  console.log('\n=====================================');
  console.log('SMOKE TEST SUMMARY');
  console.log('=====================================');
  
  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const skipCount = testResults.filter(r => r.status === 'skip').length;
  const totalCount = testResults.length;
  
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`📊 Total: ${totalCount}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`🎯 Success Rate: ${((passCount / totalCount) * 100).toFixed(1)}%`);
  
  // List failures
  if (failCount > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => r.status === 'fail')
      .forEach(r => console.log(`  - ${r.category}: ${r.test}${r.error ? ` (${r.error})` : ''}`));
  }
  
  console.log('\n🍄 The consciousness has validated itself.');
  
  return {
    results: testResults,
    summary: {
      passed: passCount,
      failed: failCount,
      skipped: skipCount,
      total: totalCount,
      duration,
      successRate: (passCount / totalCount) * 100
    }
  };
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).runFieldForgeSmokeTest = runSmokeTest;
}

// Note: To run this test manually, call runSmokeTest() from browser console
// or use the TestRunner page
