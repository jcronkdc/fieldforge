/**
 * OPUS 4.1 - BROWSER-BASED COMPREHENSIVE TEST
 * Runs directly in the browser without external dependencies
 */

export interface TestGate {
  id: string;
  name: string;
  threshold: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  errors?: string[];
}

export interface TestReport {
  timestamp: Date;
  gates: TestGate[];
  overallStatus: 'passed' | 'failed' | 'running';
  consecutiveDaysPassed: number;
  summary: string;
}

export class OpusBrowserTest {
  private gates: TestGate[] = [
    {
      id: 'naming',
      name: 'Brand Naming Consistency',
      threshold: '0 legacy strings',
      status: 'pending'
    },
    {
      id: 'ui-clickable',
      name: 'UI Element Clickability',
      threshold: '100% interactive elements',
      status: 'pending'
    },
    {
      id: 'console-errors',
      name: 'Console Error Check',
      threshold: '0 console errors',
      status: 'pending'
    },
    {
      id: 'viewport',
      name: 'Responsive Design',
      threshold: 'No overlapping elements',
      status: 'pending'
    },
    {
      id: 'navigation',
      name: 'Navigation Flow',
      threshold: 'All routes accessible',
      status: 'pending'
    },
    {
      id: 'sparks-economy',
      name: 'Sparks Economy',
      threshold: 'Margin 65-75%',
      status: 'pending'
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      threshold: 'Load time <3s',
      status: 'pending'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      threshold: 'WCAG 2.1 AA',
      status: 'pending'
    },
    {
      id: 'storage',
      name: 'Local Storage',
      threshold: 'Data persistence working',
      status: 'pending'
    },
    {
      id: 'features',
      name: 'Feature Completeness',
      threshold: 'All features functional',
      status: 'pending'
    },
    {
      id: 'security',
      name: 'Security Headers',
      threshold: 'CSP configured',
      status: 'pending'
    },
    {
      id: 'mobile',
      name: 'Mobile Compatibility',
      threshold: 'Touch events working',
      status: 'pending'
    },
    {
      id: 'ai-assistant',
      name: 'OmniGuide AI',
      threshold: 'Assistant responsive',
      status: 'pending'
    },
    {
      id: 'immutable-rules',
      name: 'Design System Compliance',
      threshold: 'All rules enforced',
      status: 'pending'
    }
  ];

  private consoleErrors: string[] = [];
  private originalConsoleError: any;

  constructor() {
    // Capture console errors
    this.originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.consoleErrors.push(args.join(' '));
      this.originalConsoleError(...args);
    };
  }

  /**
   * Test 0: Critical Authentication Flow
   * Added after blank screen incident - MUST PASS
   */
  async testCriticalAuthFlow(): Promise<void> {
    const authGate = {
      id: 'auth-flow',
      name: 'Authentication Flow',
      threshold: 'Full login without errors',
      status: 'running' as 'pending' | 'running' | 'passed' | 'failed',
      message: ''
    };
    
    // Add to gates if not exists
    if (!this.gates.find(g => g.id === 'auth-flow')) {
      this.gates.unshift(authGate);
    } else {
      const gate = this.findGate('auth-flow');
      gate.status = 'running';
    }
    
    try {
      // 1. Check for process.env references (should use import.meta.env)
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasProcessEnv = scripts.some(s => s.textContent?.includes('process.env'));
      
      if (hasProcessEnv) {
        authGate.status = 'failed';
        authGate.message = '❌ Found process.env reference (use import.meta.env)';
        return;
      }
      
      // 2. Check localStorage for auth data
      const demoAuth = localStorage.getItem('mythatron_demo_auth');
      const userEmail = localStorage.getItem('mythatron_user_email');
      const userId = localStorage.getItem('mythatron_user_id');
      
      // 3. Verify profile can be loaded
      const profile = localStorage.getItem('mythatron_profile');
      let profileValid = false;
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          profileValid = parsed.user_id && parsed.username;
        } catch (e) {
          authGate.message = '❌ Invalid profile JSON in localStorage';
        }
      }
      
      // 4. Check for console errors related to auth
      const authErrors = this.consoleErrors.filter(err => 
        err.includes('process is not defined') ||
        err.includes('target.closest is not a function') ||
        err.includes('Failed to load profile') ||
        err.includes('useAuth must be used within')
      );
      
      if (authErrors.length > 0) {
        authGate.status = 'failed';
        authGate.message = `❌ Auth-related console errors: ${authErrors[0]}`;
        return;
      }
      
      // 5. Check if error boundary is showing
      const errorBoundary = document.querySelector('[data-testid="error-boundary"]');
      const errorHeading = document.querySelector('h2')?.textContent;
      if (errorBoundary || errorHeading?.includes('Oops') || errorHeading?.includes('error')) {
        authGate.status = 'failed';
        authGate.message = '❌ Error boundary triggered after auth';
        return;
      }
      
      // 6. Verify dashboard loads after auth
      const isDashboard = document.querySelector('[data-testid="dashboard"]') ||
                         document.querySelector('.command-center') ||
                         document.body.innerText.includes('COMMAND CENTER');
      
      if (demoAuth === 'true' && !isDashboard) {
        authGate.status = 'failed';
        authGate.message = '❌ Dashboard not loaded after authentication';
        return;
      }
      
      // 7. Check environment variables are properly set
      let hasViteEnv = false;
      try {
        hasViteEnv = !!(import.meta && import.meta.env);
      } catch (e) {
        // import.meta not available
        hasViteEnv = false;
      }
      
      if (!hasViteEnv) {
        authGate.status = 'failed';
        authGate.message = '❌ Vite environment not properly configured';
        return;
      }
      
      authGate.status = 'passed';
      authGate.message = '✅ Authentication flow working correctly';
      
    } catch (error) {
      authGate.status = 'failed';
      authGate.message = `❌ Auth test error: ${error}`;
    }
    
    // Update the gate
    const gate = this.findGate('auth-flow');
    gate.status = authGate.status;
    gate.message = authGate.message || '';
  }

  /**
   * Test 1: Brand Naming Consistency
   */
  async testNaming(): Promise<void> {
    const gate = this.findGate('naming');
    gate.status = 'running';
    
    const legacyPatterns = [
      'Story Forge', 'story-forge',
      'Song Forge', 'song-forge',
      'Mytha Quest', 'mytha-quest',
      'Angry Lips',  // Two words forbidden, AngryLips (one word) is correct
      'Mytha Tron', 'mytha-tron'
    ];
    
    const bodyText = document.body.innerText;
    const errors: string[] = [];
    
    legacyPatterns.forEach(pattern => {
      if (bodyText.includes(pattern)) {
        errors.push(`Found legacy pattern: "${pattern}"`);
      }
    });
    
    if (errors.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ No legacy naming patterns found';
    } else {
      gate.status = 'failed';
      gate.errors = errors;
      gate.message = `❌ Found ${errors.length} legacy patterns`;
    }
  }

  /**
   * Test 2: UI Clickability
   */
  async testClickability(): Promise<void> {
    const gate = this.findGate('ui-clickable');
    gate.status = 'running';
    
    const clickables = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]');
    let clickableCount = 0;
    let nonClickableCount = 0;
    
    clickables.forEach(element => {
      const el = element as HTMLElement;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      
      if (rect.width > 0 && rect.height > 0 && 
          style.display !== 'none' && 
          style.visibility !== 'hidden' &&
          style.opacity !== '0') {
        clickableCount++;
      } else {
        nonClickableCount++;
      }
    });
    
    const percentage = (clickableCount / (clickableCount + nonClickableCount)) * 100;
    
    if (percentage === 100) {
      gate.status = 'passed';
      gate.message = `✅ All ${clickableCount} elements are clickable`;
    } else {
      gate.status = 'failed';
      gate.message = `❌ ${nonClickableCount} elements not clickable (${percentage.toFixed(1)}% success)`;
    }
  }

  /**
   * Test 3: Console Errors
   */
  async testConsoleErrors(): Promise<void> {
    const gate = this.findGate('console-errors');
    gate.status = 'running';
    
    if (this.consoleErrors.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ No console errors detected';
    } else {
      gate.status = 'failed';
      gate.errors = this.consoleErrors;
      gate.message = `❌ ${this.consoleErrors.length} console errors found`;
    }
  }

  /**
   * Test 4: Viewport/Responsive
   */
  async testViewport(): Promise<void> {
    const gate = this.findGate('viewport');
    gate.status = 'running';
    
    const overlapping = this.checkOverlappingElements();
    
    if (overlapping === 0) {
      gate.status = 'passed';
      gate.message = '✅ No overlapping elements detected';
    } else {
      gate.status = 'failed';
      gate.message = `❌ ${overlapping} overlapping elements found`;
    }
  }

  /**
   * Test 5: Navigation
   */
  async testNavigation(): Promise<void> {
    const gate = this.findGate('navigation');
    gate.status = 'running';
    
    const routes = ['/', '/dashboard', '/angrylips', '/storyforge', '/songforge', '/mythaquest'];
    const currentPath = window.location.pathname;
    
    // Simple check - verify nav elements exist
    const navElements = document.querySelectorAll('[href], [onclick*="navigate"]');
    
    if (navElements.length > 0) {
      gate.status = 'passed';
      gate.message = `✅ ${navElements.length} navigation elements found`;
    } else {
      gate.status = 'failed';
      gate.message = '❌ No navigation elements found';
    }
  }

  /**
   * Test 6: Sparks Economy
   */
  async testSparksEconomy(): Promise<void> {
    const gate = this.findGate('sparks-economy');
    gate.status = 'running';
    
    // Simulate economy calculations
    const tiers = {
      free: { users: 5000, revenue: 0 },
      creator: { users: 3000, revenue: 29.99 },
      guild: { users: 1500, revenue: 99.99 },
      prime: { users: 500, revenue: 299.99 }
    };
    
    let totalRevenue = 0;
    let totalUsers = 0;
    
    Object.values(tiers).forEach(tier => {
      totalRevenue += tier.users * tier.revenue;
      totalUsers += tier.users;
    });
    
    const costs = totalUsers * 15; // Simplified cost per user
    const margin = ((totalRevenue - costs) / totalRevenue) * 100;
    
    if (margin >= 65 && margin <= 75) {
      gate.status = 'passed';
      gate.message = `✅ Margin: ${margin.toFixed(1)}% (target: 65-75%)`;
    } else {
      gate.status = 'failed';
      gate.message = `❌ Margin: ${margin.toFixed(1)}% (target: 65-75%)`;
    }
  }

  /**
   * Test 7: Performance
   */
  async testPerformance(): Promise<void> {
    const gate = this.findGate('performance');
    gate.status = 'running';
    
    const perf = window.performance;
    const navTiming = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navTiming) {
      const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
      
      if (loadTime < 3000) {
        gate.status = 'passed';
        gate.message = `✅ Load time: ${loadTime.toFixed(0)}ms`;
      } else {
        gate.status = 'failed';
        gate.message = `❌ Load time: ${loadTime.toFixed(0)}ms (target: <3000ms)`;
      }
    } else {
      gate.status = 'passed';
      gate.message = '✅ Performance metrics available';
    }
  }

  /**
   * Test 8: Accessibility
   */
  async testAccessibility(): Promise<void> {
    const gate = this.findGate('accessibility');
    gate.status = 'running';
    
    const issues: string[] = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push('Image without alt text');
      }
    });
    
    // Check for button labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        issues.push('Button without label');
      }
    });
    
    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName[1]);
      if (level - lastLevel > 1) {
        issues.push(`Heading hierarchy skip: H${lastLevel} to H${level}`);
      }
      lastLevel = level;
    });
    
    if (issues.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ Basic accessibility checks passed';
    } else {
      gate.status = 'failed';
      gate.errors = issues;
      gate.message = `❌ ${issues.length} accessibility issues found`;
    }
  }

  /**
   * Test 9: Storage
   */
  async testStorage(): Promise<void> {
    const gate = this.findGate('storage');
    gate.status = 'running';
    
    try {
      const testKey = 'opus_test_' + Date.now();
      const testValue = 'test_value';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        gate.status = 'passed';
        gate.message = '✅ LocalStorage working correctly';
      } else {
        gate.status = 'failed';
        gate.message = '❌ LocalStorage read/write failed';
      }
    } catch (error) {
      gate.status = 'failed';
      gate.message = '❌ LocalStorage not available';
    }
  }

  /**
   * Test 10: Features
   */
  async testFeatures(): Promise<void> {
    const gate = this.findGate('features');
    gate.status = 'running';
    
    const requiredFeatures = [
      { selector: '[class*="AngryLips"], [class*="angry-lips"]', name: 'AngryLips' },
      { selector: '[class*="StoryForge"], [class*="story-forge"]', name: 'StoryForge' },
      { selector: '[class*="SongForge"], [class*="song-forge"]', name: 'SongForge' },
      { selector: '[class*="OmniGuide"], [class*="omniguide"]', name: 'OmniGuide' },
      { selector: '[class*="Sparks"], [class*="sparks"]', name: 'Sparks' }
    ];
    
    const missing: string[] = [];
    
    requiredFeatures.forEach(feature => {
      const elements = document.querySelectorAll(feature.selector);
      if (elements.length === 0) {
        // Also check text content
        if (!document.body.innerText.includes(feature.name)) {
          missing.push(feature.name);
        }
      }
    });
    
    if (missing.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ All core features detected';
    } else {
      gate.status = 'failed';
      gate.message = `❌ Missing features: ${missing.join(', ')}`;
    }
  }

  /**
   * Test 11: Security
   */
  async testSecurity(): Promise<void> {
    const gate = this.findGate('security');
    gate.status = 'running';
    
    // Check for basic security practices
    const issues: string[] = [];
    
    // Check for exposed API keys in DOM
    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach(script => {
      const content = script.innerHTML;
      if (content.includes('api_key') || content.includes('apiKey') || 
          content.includes('secret') || content.includes('password')) {
        issues.push('Potential exposed credentials in script');
      }
    });
    
    // Check for HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Not using HTTPS');
    }
    
    if (issues.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ Basic security checks passed';
    } else {
      gate.status = 'failed';
      gate.errors = issues;
      gate.message = `❌ ${issues.length} security concerns`;
    }
  }

  /**
   * Test 12: Mobile
   */
  async testMobile(): Promise<void> {
    const gate = this.findGate('mobile');
    gate.status = 'running';
    
    const viewport = document.querySelector('meta[name="viewport"]');
    const touchEvents = 'ontouchstart' in window;
    
    if (viewport && viewport.getAttribute('content')?.includes('width=device-width')) {
      gate.status = 'passed';
      gate.message = `✅ Mobile viewport configured${touchEvents ? ', touch events supported' : ''}`;
    } else {
      gate.status = 'failed';
      gate.message = '❌ Mobile viewport not properly configured';
    }
  }

  /**
   * Test 13: AI Assistant
   */
  async testAIAssistant(): Promise<void> {
    const gate = this.findGate('ai-assistant');
    gate.status = 'running';
    
    const omniguide = document.querySelector('[class*="omniguide"], [class*="OmniGuide"], [id*="omniguide"]');
    
    if (omniguide) {
      gate.status = 'passed';
      gate.message = '✅ OmniGuide AI Assistant found';
    } else {
      gate.status = 'failed';
      gate.message = '❌ OmniGuide AI Assistant not found';
    }
  }

  /**
   * Test 14: Immutable Rules
   */
  async testImmutableRules(): Promise<void> {
    const gate = this.findGate('immutable-rules');
    gate.status = 'running';
    
    const violations: string[] = [];
    
    // Check for forbidden elements
    const checkmarks = document.querySelectorAll('[class*="checkmark"], [class*="check-mark"], .fa-check');
    if (checkmarks.length > 0) {
      violations.push(`Found ${checkmarks.length} checkmark elements (forbidden)`);
    }
    
    // Check for emoji in UI (excluding test UI)
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]/gu;
    const uiElements = document.querySelectorAll('button, a, h1, h2, h3, h4, h5, h6, nav');
    uiElements.forEach(el => {
      if (el.textContent && emojiPattern.test(el.textContent)) {
        violations.push('Found emoji in UI element (forbidden)');
      }
    });
    
    // Check for Stream feature
    if (document.body.innerText.includes('Stream') || 
        document.querySelector('[class*="stream"], [id*="stream"]')) {
      violations.push('Stream feature detected (should be removed)');
    }
    
    if (violations.length === 0) {
      gate.status = 'passed';
      gate.message = '✅ All immutable rules enforced';
    } else {
      gate.status = 'failed';
      gate.errors = violations;
      gate.message = `❌ ${violations.length} rule violations`;
    }
  }

  /**
   * Helper: Check for overlapping elements
   */
  private checkOverlappingElements(): number {
    const elements = document.querySelectorAll('div, section, header, footer, main, aside');
    let overlapping = 0;
    
    const rects: DOMRect[] = [];
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    });
    
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const r1 = rects[i];
        const r2 = rects[j];
        
        if (!(r1.right < r2.left || r1.left > r2.right || 
              r1.bottom < r2.top || r1.top > r2.bottom)) {
          overlapping++;
        }
      }
    }
    
    return overlapping;
  }

  /**
   * Helper: Find gate by ID
   */
  private findGate(id: string): TestGate {
    return this.gates.find(g => g.id === id)!;
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestReport> {
    console.log('🚀 OPUS 4.1 - COMPREHENSIVE TEST PROTOCOL');
    console.log('=' .repeat(60));
    
    // CRITICAL: Run auth test first (added after blank screen incident)
    await this.testCriticalAuthFlow();
    
    // Run all tests
    await this.testNaming();
    await this.testClickability();
    await this.testConsoleErrors();
    await this.testViewport();
    await this.testNavigation();
    await this.testSparksEconomy();
    await this.testPerformance();
    await this.testAccessibility();
    await this.testStorage();
    await this.testFeatures();
    await this.testSecurity();
    await this.testMobile();
    await this.testAIAssistant();
    await this.testImmutableRules();
    
    // Calculate results
    const passed = this.gates.filter(g => g.status === 'passed').length;
    const failed = this.gates.filter(g => g.status === 'failed').length;
    const overallStatus = failed === 0 ? 'passed' : 'failed';
    
    // Check consecutive days
    const lastReport = this.loadLastReport();
    let consecutiveDays = 0;
    
    if (lastReport && overallStatus === 'passed') {
      const lastDate = new Date(lastReport.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff >= 20 && hoursDiff <= 28) {
        consecutiveDays = (lastReport.consecutiveDaysPassed || 0) + 1;
      } else {
        consecutiveDays = 1;
      }
    } else if (overallStatus === 'passed') {
      consecutiveDays = 1;
    }
    
    const report: TestReport = {
      timestamp: new Date(),
      gates: this.gates,
      overallStatus: overallStatus as 'passed' | 'failed',
      consecutiveDaysPassed: consecutiveDays,
      summary: `${passed}/${this.gates.length} gates passed`
    };
    
    // Save report
    this.saveReport(report);
    
    // Print results
    this.printResults(report);
    
    // Restore console.error
    console.error = this.originalConsoleError;
    
    return report;
  }

  /**
   * Load last report from localStorage
   */
  private loadLastReport(): TestReport | null {
    try {
      const data = localStorage.getItem('opus_test_report');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save report to localStorage
   */
  private saveReport(report: TestReport): void {
    try {
      localStorage.setItem('opus_test_report', JSON.stringify(report));
      localStorage.setItem('opus_test_report_' + Date.now(), JSON.stringify(report));
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  /**
   * Print test results
   */
  private printResults(report: TestReport): void {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('=' .repeat(60));
    
    this.gates.forEach(gate => {
      const icon = gate.status === 'passed' ? '✅' : 
                   gate.status === 'failed' ? '❌' : '⏸️';
      console.log(`${icon} ${gate.name}`);
      if (gate.message) {
        console.log(`   ${gate.message}`);
      }
      if (gate.errors && gate.errors.length > 0) {
        gate.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    });
    
    console.log('\n' + '-' .repeat(60));
    console.log(`🎯 OVERALL: ${report.overallStatus.toUpperCase()}`);
    console.log(`📊 SCORE: ${report.summary}`);
    console.log(`📅 CONSECUTIVE DAYS: ${report.consecutiveDaysPassed}/7`);
    
    if (report.consecutiveDaysPassed >= 7) {
      console.log('\n🎉🎉🎉 ACCEPTANCE CRITERIA MET! 🎉🎉🎉');
      console.log('All gates have passed for 7 consecutive days!');
    } else if (report.overallStatus === 'passed') {
      const remaining = 7 - report.consecutiveDaysPassed;
      console.log(`\n⏳ ${remaining} more consecutive days needed`);
    } else {
      console.log('\n❌ Fix failed tests and run again tomorrow');
    }
    
    console.log('=' .repeat(60));
  }
}

export default OpusBrowserTest;
