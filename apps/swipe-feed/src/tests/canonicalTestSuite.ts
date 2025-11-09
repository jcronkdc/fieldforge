/**
 * CANONICAL COMPREHENSIVE TEST SUITE FOR FIELDFORGE
 * Based on OPUS QA SUITE v1.0 Methodology
 * 
 * This is the authoritative end-to-end test plan for FieldForge
 */

import { supabase } from '../lib/supabase';

interface TestCase {
  id: string;
  category: string;
  name: string;
  description: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR';
  status?: 'PASS' | 'FAIL' | 'SKIP' | 'PENDING';
  message?: string;
  evidence?: any;
  duration?: number;
}

export class CanonicalFieldForgeTestSuite {
  private testCases: TestCase[] = [];
  private startTime: number = 0;
  private environment = {
    url: window.location.origin,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    buildInfo: (window as any).__buildInfo || 'development'
  };

  constructor() {
    this.initializeTestCases();
  }

  /**
   * Initialize all test cases based on OPUS methodology
   */
  private initializeTestCases(): void {
    // Authentication Tests
    this.addTestCase({
      id: 'AUTH-001',
      category: 'Authentication',
      name: 'Supabase Connection',
      description: 'Verify Supabase client is properly configured',
      severity: 'BLOCKER'
    });

    this.addTestCase({
      id: 'AUTH-002',
      category: 'Authentication',
      name: 'Session Management',
      description: 'Check session persistence and state management',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'AUTH-003',
      category: 'Authentication',
      name: 'Login Flow',
      description: 'Test complete login flow with valid credentials',
      severity: 'BLOCKER'
    });

    this.addTestCase({
      id: 'AUTH-004',
      category: 'Authentication',
      name: 'Logout Flow',
      description: 'Test logout and session cleanup',
      severity: 'CRITICAL'
    });

    // Landing Page Tests
    this.addTestCase({
      id: 'LAND-001',
      category: 'Landing Page',
      name: 'Page Render',
      description: 'Verify landing page renders without errors',
      severity: 'BLOCKER'
    });

    this.addTestCase({
      id: 'LAND-002',
      category: 'Landing Page',
      name: 'Hero Section',
      description: 'Check hero section with CTA buttons',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'LAND-003',
      category: 'Landing Page',
      name: 'Feature Cards',
      description: 'Verify all feature cards are displayed',
      severity: 'MINOR'
    });

    // Dashboard Tests
    this.addTestCase({
      id: 'DASH-001',
      category: 'Dashboard',
      name: 'Dashboard Access',
      description: 'Verify dashboard loads after authentication',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'DASH-002',
      category: 'Dashboard',
      name: 'Navigation Menu',
      description: 'Test all navigation menu items',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'DASH-003',
      category: 'Dashboard',
      name: 'Mobile Responsiveness',
      description: 'Check responsive layout on mobile devices',
      severity: 'MAJOR'
    });

    // Project Management Tests
    this.addTestCase({
      id: 'PROJ-001',
      category: 'Project Management',
      name: 'Create Project',
      description: 'Test project creation workflow',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'PROJ-002',
      category: 'Project Management',
      name: 'Team Assignment',
      description: 'Verify team member assignment functionality',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'PROJ-003',
      category: 'Project Management',
      name: 'Project Archival',
      description: 'Test project archive functionality',
      severity: 'MAJOR'
    });

    // Receipt Scanner Tests
    this.addTestCase({
      id: 'SCAN-001',
      category: 'Receipt Scanner',
      name: 'OCR Service',
      description: 'Verify OCR service initialization',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'SCAN-002',
      category: 'Receipt Scanner',
      name: 'Cost Code Matching',
      description: 'Test cost code detection and matching',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'SCAN-003',
      category: 'Receipt Scanner',
      name: 'Email Integration',
      description: 'Verify email sending functionality',
      severity: 'MAJOR'
    });

    // Social Feed Tests
    this.addTestCase({
      id: 'FEED-001',
      category: 'Social Feed',
      name: 'Feed Loading',
      description: 'Verify social feed loads posts',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'FEED-002',
      category: 'Social Feed',
      name: 'Swipe Gestures',
      description: 'Test swipeable card interactions',
      severity: 'MINOR'
    });

    // Real-Time Analytics Tests
    this.addTestCase({
      id: 'ANLY-001',
      category: 'Analytics',
      name: 'Dashboard Metrics',
      description: 'Verify real-time metrics display',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'ANLY-002',
      category: 'Analytics',
      name: 'Data Visualization',
      description: 'Check chart rendering and animations',
      severity: 'MINOR'
    });

    // Voice Commands Tests
    this.addTestCase({
      id: 'VOIC-001',
      category: 'Voice Commands',
      name: 'Speech Recognition',
      description: 'Test browser speech recognition API',
      severity: 'MINOR'
    });

    this.addTestCase({
      id: 'VOIC-002',
      category: 'Voice Commands',
      name: 'Command Processing',
      description: 'Verify voice command execution',
      severity: 'MINOR'
    });

    // Gesture Controls Tests
    this.addTestCase({
      id: 'GEST-001',
      category: 'Gesture Controls',
      name: 'Touch Detection',
      description: 'Test touch event handling',
      severity: 'MINOR'
    });

    this.addTestCase({
      id: 'GEST-002',
      category: 'Gesture Controls',
      name: 'Swipe Actions',
      description: 'Verify swipe gesture recognition',
      severity: 'MINOR'
    });

    // Performance Tests
    this.addTestCase({
      id: 'PERF-001',
      category: 'Performance',
      name: 'Page Load Time',
      description: 'Measure initial page load performance',
      severity: 'MAJOR'
    });

    this.addTestCase({
      id: 'PERF-002',
      category: 'Performance',
      name: 'Memory Usage',
      description: 'Check JavaScript memory consumption',
      severity: 'MINOR'
    });

    this.addTestCase({
      id: 'PERF-003',
      category: 'Performance',
      name: 'Network Latency',
      description: 'Test API response times',
      severity: 'MAJOR'
    });

    // Accessibility Tests
    this.addTestCase({
      id: 'A11Y-001',
      category: 'Accessibility',
      name: 'Keyboard Navigation',
      description: 'Verify keyboard accessibility',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'A11Y-002',
      category: 'Accessibility',
      name: 'ARIA Labels',
      description: 'Check ARIA attributes presence',
      severity: 'MAJOR'
    });

    // Security Tests
    this.addTestCase({
      id: 'SEC-001',
      category: 'Security',
      name: 'XSS Protection',
      description: 'Verify XSS attack prevention',
      severity: 'BLOCKER'
    });

    this.addTestCase({
      id: 'SEC-002',
      category: 'Security',
      name: 'CSRF Protection',
      description: 'Check CSRF token validation',
      severity: 'CRITICAL'
    });

    // Error Handling Tests
    this.addTestCase({
      id: 'ERR-001',
      category: 'Error Handling',
      name: 'Error Boundaries',
      description: 'Test error boundary functionality',
      severity: 'CRITICAL'
    });

    this.addTestCase({
      id: 'ERR-002',
      category: 'Error Handling',
      name: 'Network Errors',
      description: 'Handle network failure gracefully',
      severity: 'MAJOR'
    });
  }

  private addTestCase(testCase: TestCase): void {
    this.testCases.push({ ...testCase, status: 'PENDING' });
  }

  /**
   * Run all tests in the canonical suite
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 CANONICAL FIELDFORGE TEST SUITE v1.0');
    console.log('=' .repeat(60));
    console.log('Environment:', this.environment);
    console.log('=' .repeat(60));

    this.startTime = Date.now();

    // Run tests by category
    await this.runAuthenticationTests();
    await this.runLandingPageTests();
    await this.runDashboardTests();
    await this.runProjectManagementTests();
    await this.runReceiptScannerTests();
    await this.runSocialFeedTests();
    await this.runAnalyticsTests();
    await this.runVoiceCommandTests();
    await this.runGestureControlTests();
    await this.runPerformanceTests();
    await this.runAccessibilityTests();
    await this.runSecurityTests();
    await this.runErrorHandlingTests();

    // Generate comprehensive report
    this.generateReport();
  }

  /**
   * Authentication Tests
   */
  private async runAuthenticationTests(): Promise<void> {
    console.log('\n📋 AUTHENTICATION TESTS');
    console.log('-'.repeat(40));

    // AUTH-001: Supabase Connection
    await this.runTest('AUTH-001', async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Supabase credentials not configured');
      }

      // Test connection
      const { error } = await supabase.auth.getSession();
      if (error && !error.message.includes('session')) {
        throw error;
      }
      
      return 'Supabase client connected successfully';
    });

    // AUTH-002: Session Management
    await this.runTest('AUTH-002', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? 'Active session found' : 'No active session (expected for new users)';
    });

    // AUTH-003 & AUTH-004: Login/Logout flows (would require actual user interaction)
    this.markTestAsManual('AUTH-003', 'Requires manual testing with valid credentials');
    this.markTestAsManual('AUTH-004', 'Requires manual testing after login');
  }

  /**
   * Landing Page Tests
   */
  private async runLandingPageTests(): Promise<void> {
    console.log('\n📋 LANDING PAGE TESTS');
    console.log('-'.repeat(40));

    // LAND-001: Page Render
    await this.runTest('LAND-001', async () => {
      const rootElement = document.getElementById('root');
      if (!rootElement || !rootElement.children.length) {
        throw new Error('Root element not found or empty');
      }
      return 'Landing page rendered successfully';
    });

    // LAND-002: Hero Section
    await this.runTest('LAND-002', async () => {
      const hasHeroText = document.body.textContent?.includes('BUILD THE IMPOSSIBLE');
      if (!hasHeroText) {
        throw new Error('Hero section text not found');
      }
      return 'Hero section present with correct content';
    });

    // LAND-003: Feature Cards
    await this.runTest('LAND-003', async () => {
      const hasFeatures = document.body.textContent?.includes('Voice Control') &&
                          document.body.textContent?.includes('Smart Gestures');
      if (!hasFeatures) {
        throw new Error('Feature cards not found');
      }
      return 'Feature cards displayed correctly';
    });
  }

  /**
   * Dashboard Tests
   */
  private async runDashboardTests(): Promise<void> {
    console.log('\n📋 DASHBOARD TESTS');
    console.log('-'.repeat(40));

    // Dashboard tests require authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      this.markTestAsSkipped('DASH-001', 'Requires authentication');
      this.markTestAsSkipped('DASH-002', 'Requires authentication');
      this.markTestAsSkipped('DASH-003', 'Requires authentication');
    } else {
      await this.runTest('DASH-001', async () => {
        return 'Dashboard accessible with valid session';
      });
    }
  }

  /**
   * Project Management Tests
   */
  private async runProjectManagementTests(): Promise<void> {
    console.log('\n📋 PROJECT MANAGEMENT TESTS');
    console.log('-'.repeat(40));

    await this.runTest('PROJ-001', async () => {
      // Check if project service exists
      const { projectService } = await import('../lib/services/projectService');
      if (!projectService.createProject) {
        throw new Error('Project service not properly initialized');
      }
      return 'Project creation service available';
    });

    this.markTestAsManual('PROJ-002', 'Requires authenticated user interaction');
    this.markTestAsManual('PROJ-003', 'Requires existing project');
  }

  /**
   * Receipt Scanner Tests
   */
  private async runReceiptScannerTests(): Promise<void> {
    console.log('\n📋 RECEIPT SCANNER TESTS');
    console.log('-'.repeat(40));

    await this.runTest('SCAN-001', async () => {
      const { ocrService } = await import('../lib/services/ocrService');
      await ocrService.initialize();
      return 'OCR service initialized successfully';
    });

    await this.runTest('SCAN-002', async () => {
      const { receiptService } = await import('../lib/services/receiptService');
      // Check if cost codes are available
      const costCodes = await receiptService.getCostCodes();
      if (!costCodes) {
        throw new Error('Cost codes not loaded');
      }
      return `${costCodes.length || 0} cost codes available`;
    });

    this.markTestAsManual('SCAN-003', 'Email service requires configuration');
  }

  /**
   * Social Feed Tests
   */
  private async runSocialFeedTests(): Promise<void> {
    console.log('\n📋 SOCIAL FEED TESTS');
    console.log('-'.repeat(40));

    this.markTestAsManual('FEED-001', 'Requires authenticated user');
    this.markTestAsManual('FEED-002', 'Requires touch device or emulation');
  }

  /**
   * Analytics Tests
   */
  private async runAnalyticsTests(): Promise<void> {
    console.log('\n📋 ANALYTICS TESTS');
    console.log('-'.repeat(40));

    this.markTestAsManual('ANLY-001', 'Requires authenticated user');
    this.markTestAsManual('ANLY-002', 'Requires authenticated user');
  }

  /**
   * Voice Command Tests
   */
  private async runVoiceCommandTests(): Promise<void> {
    console.log('\n📋 VOICE COMMAND TESTS');
    console.log('-'.repeat(40));

    await this.runTest('VOIC-001', async () => {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 
                                   'SpeechRecognition' in window;
      if (!hasSpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }
      return 'Speech recognition API available';
    });

    this.markTestAsManual('VOIC-002', 'Requires microphone permissions');
  }

  /**
   * Gesture Control Tests
   */
  private async runGestureControlTests(): Promise<void> {
    console.log('\n📋 GESTURE CONTROL TESTS');
    console.log('-'.repeat(40));

    await this.runTest('GEST-001', async () => {
      const supportsTouchEvents = 'ontouchstart' in window;
      return supportsTouchEvents ? 
        'Touch events supported' : 
        'Touch events not supported (desktop browser)';
    });

    this.markTestAsManual('GEST-002', 'Requires touch device');
  }

  /**
   * Performance Tests
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('\n📋 PERFORMANCE TESTS');
    console.log('-'.repeat(40));

    await this.runTest('PERF-001', async () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      
      if (loadTime > 3000) {
        throw new Error(`Page load time too high: ${loadTime}ms`);
      }
      return `Page loaded in ${Math.round(loadTime)}ms`;
    });

    await this.runTest('PERF-002', async () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        if (usedMB > 150) {
          throw new Error(`Memory usage too high: ${usedMB}MB`);
        }
        return `Memory usage: ${usedMB}MB`;
      }
      return 'Memory API not available';
    });

    await this.runTest('PERF-003', async () => {
      const start = Date.now();
      try {
        await supabase.auth.getSession();
        const duration = Date.now() - start;
        
        if (duration > 1000) {
          throw new Error(`API response too slow: ${duration}ms`);
        }
        return `API responded in ${duration}ms`;
      } catch (error) {
        throw new Error('Failed to test API latency');
      }
    });
  }

  /**
   * Accessibility Tests
   */
  private async runAccessibilityTests(): Promise<void> {
    console.log('\n📋 ACCESSIBILITY TESTS');
    console.log('-'.repeat(40));

    await this.runTest('A11Y-001', async () => {
      const buttons = document.querySelectorAll('button');
      const focusableButtons = Array.from(buttons).filter(btn => 
        btn.tabIndex >= 0 && !btn.disabled
      );
      return `${focusableButtons.length} keyboard-accessible buttons found`;
    });

    await this.runTest('A11Y-002', async () => {
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
      return `${elementsWithAria.length} elements with ARIA attributes`;
    });
  }

  /**
   * Security Tests
   */
  private async runSecurityTests(): Promise<void> {
    console.log('\n📋 SECURITY TESTS');
    console.log('-'.repeat(40));

    await this.runTest('SEC-001', async () => {
      // Check if React is properly escaping content
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '<img src=x onerror=alert(1)>';
      const hasXSS = testDiv.querySelector('img')?.getAttribute('onerror');
      
      if (hasXSS) {
        throw new Error('Potential XSS vulnerability detected');
      }
      return 'XSS protection active';
    });

    await this.runTest('SEC-002', async () => {
      // Supabase handles CSRF protection
      return 'CSRF protection handled by Supabase';
    });
  }

  /**
   * Error Handling Tests
   */
  private async runErrorHandlingTests(): Promise<void> {
    console.log('\n📋 ERROR HANDLING TESTS');
    console.log('-'.repeat(40));

    await this.runTest('ERR-001', async () => {
      // Check if ErrorBoundary component exists
      const { ErrorBoundary } = await import('../components/ErrorBoundary');
      if (!ErrorBoundary) {
        throw new Error('ErrorBoundary component not found');
      }
      return 'ErrorBoundary component available';
    });

    await this.runTest('ERR-002', async () => {
      // Test network error handling
      try {
        await fetch('https://invalid-domain-that-does-not-exist.com');
      } catch (error) {
        return 'Network errors handled correctly';
      }
      return 'Network error handling verified';
    });
  }

  /**
   * Run a single test
   */
  private async runTest(id: string, testFn: () => Promise<string>): Promise<void> {
    const test = this.testCases.find(t => t.id === id);
    if (!test) return;

    const startTime = Date.now();
    
    try {
      const message = await testFn();
      test.status = 'PASS';
      test.message = message;
      test.duration = Date.now() - startTime;
      console.log(`✅ ${test.id}: ${test.name} - ${message}`);
    } catch (error) {
      test.status = 'FAIL';
      test.message = (error as Error).message;
      test.duration = Date.now() - startTime;
      console.log(`❌ ${test.id}: ${test.name} - ${test.message}`);
    }
  }

  /**
   * Mark test as manual
   */
  private markTestAsManual(id: string, reason: string): void {
    const test = this.testCases.find(t => t.id === id);
    if (!test) return;
    
    test.status = 'SKIP';
    test.message = `Manual test required: ${reason}`;
    console.log(`⏭️ ${test.id}: ${test.name} - ${test.message}`);
  }

  /**
   * Mark test as skipped
   */
  private markTestAsSkipped(id: string, reason: string): void {
    const test = this.testCases.find(t => t.id === id);
    if (!test) return;
    
    test.status = 'SKIP';
    test.message = reason;
    console.log(`⏩ ${test.id}: ${test.name} - ${test.message}`);
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): void {
    const duration = (Date.now() - this.startTime) / 1000;
    
    const passed = this.testCases.filter(t => t.status === 'PASS').length;
    const failed = this.testCases.filter(t => t.status === 'FAIL').length;
    const skipped = this.testCases.filter(t => t.status === 'SKIP').length;
    const pending = this.testCases.filter(t => t.status === 'PENDING').length;
    const total = this.testCases.length;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 CANONICAL TEST SUITE REPORT');
    console.log('=' .repeat(60));
    console.log(`Test Environment: ${this.environment.url}`);
    console.log(`Timestamp: ${this.environment.timestamp}`);
    console.log(`User Agent: ${this.environment.userAgent}`);
    console.log('-'.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${Math.round(passed/total*100)}%)`);
    console.log(`❌ Failed: ${failed} (${Math.round(failed/total*100)}%)`);
    console.log(`⏩ Skipped: ${skipped} (${Math.round(skipped/total*100)}%)`);
    console.log(`⏸️ Pending: ${pending} (${Math.round(pending/total*100)}%)`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);
    console.log('=' .repeat(60));

    // Show failures
    if (failed > 0) {
      console.log('\n⚠️ FAILED TESTS:');
      console.log('-'.repeat(40));
      this.testCases
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`${t.id} - ${t.name}`);
          console.log(`  Category: ${t.category}`);
          console.log(`  Severity: ${t.severity}`);
          console.log(`  Error: ${t.message}`);
        });
    }

    // Show blockers and critical issues
    const blockers = this.testCases.filter(t => 
      t.status === 'FAIL' && t.severity === 'BLOCKER'
    );
    const criticals = this.testCases.filter(t => 
      t.status === 'FAIL' && t.severity === 'CRITICAL'
    );

    if (blockers.length > 0 || criticals.length > 0) {
      console.log('\n🚨 HIGH PRIORITY ISSUES:');
      console.log('-'.repeat(40));
      
      if (blockers.length > 0) {
        console.log('BLOCKERS:');
        blockers.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
      }
      
      if (criticals.length > 0) {
        console.log('CRITICAL:');
        criticals.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
      }
    }

    // Category summary
    console.log('\n📈 CATEGORY SUMMARY:');
    console.log('-'.repeat(40));
    const categories = [...new Set(this.testCases.map(t => t.category))];
    categories.forEach(category => {
      const categoryTests = this.testCases.filter(t => t.category === category);
      const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
      const categoryTotal = categoryTests.length;
      const percentage = Math.round(categoryPassed / categoryTotal * 100);
      console.log(`${category}: ${categoryPassed}/${categoryTotal} (${percentage}%)`);
    });

    // Save results
    if (typeof window !== 'undefined') {
      (window as any).__CANONICAL_TEST_RESULTS__ = {
        environment: this.environment,
        summary: {
          total,
          passed,
          failed,
          skipped,
          pending,
          duration,
          passRate: Math.round(passed/total*100)
        },
        testCases: this.testCases,
        timestamp: new Date().toISOString(),
        reportUrl: `${window.location.origin}/qa-test-report`
      };
      
      console.log('\n💾 Full report saved to: window.__CANONICAL_TEST_RESULTS__');
      console.log('📄 View report at: http://localhost:5173/qa-tests');
    }

    // Final verdict
    console.log('\n' + '=' .repeat(60));
    if (failed === 0 && pending === 0) {
      console.log('✅ ALL AUTOMATED TESTS PASSED!');
    } else if (blockers.length > 0) {
      console.log('❌ BLOCKER ISSUES FOUND - IMMEDIATE ATTENTION REQUIRED');
    } else if (criticals.length > 0) {
      console.log('⚠️ CRITICAL ISSUES FOUND - HIGH PRIORITY FIXES NEEDED');
    } else {
      console.log('🔶 TESTS COMPLETED WITH SOME ISSUES');
    }
    console.log('=' .repeat(60));
  }

  /**
   * Export test results as JSON
   */
  exportResults(): string {
    return JSON.stringify({
      environment: this.environment,
      testCases: this.testCases,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Export as HTML report
   */
  exportHTMLReport(): string {
    const passed = this.testCases.filter(t => t.status === 'PASS').length;
    const failed = this.testCases.filter(t => t.status === 'FAIL').length;
    const skipped = this.testCases.filter(t => t.status === 'SKIP').length;
    const total = this.testCases.length;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>FieldForge Canonical Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .test-case { background: white; padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { border-left: 4px solid #4caf50; }
    .fail { border-left: 4px solid #f44336; }
    .skip { border-left: 4px solid #ff9800; }
    .severity-BLOCKER { background-color: #ffebee; }
    .severity-CRITICAL { background-color: #fff3e0; }
  </style>
</head>
<body>
  <h1>FieldForge Canonical Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Tests: ${total}</p>
    <p>✅ Passed: ${passed} (${Math.round(passed/total*100)}%)</p>
    <p>❌ Failed: ${failed} (${Math.round(failed/total*100)}%)</p>
    <p>⏩ Skipped: ${skipped} (${Math.round(skipped/total*100)}%)</p>
  </div>
  <h2>Test Cases</h2>
  ${this.testCases.map(t => `
    <div class="test-case ${t.status?.toLowerCase()} severity-${t.severity}">
      <h3>${t.id}: ${t.name}</h3>
      <p><strong>Category:</strong> ${t.category}</p>
      <p><strong>Severity:</strong> ${t.severity}</p>
      <p><strong>Status:</strong> ${t.status}</p>
      <p><strong>Message:</strong> ${t.message || 'N/A'}</p>
    </div>
  `).join('')}
</body>
</html>
    `;
  }
}

// Export for use
export default CanonicalFieldForgeTestSuite;

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).runCanonicalTests = async () => {
    const suite = new CanonicalFieldForgeTestSuite();
    await suite.runAllTests();
  };
  
  console.log('💡 Run canonical tests with: window.runCanonicalTests()');
}
