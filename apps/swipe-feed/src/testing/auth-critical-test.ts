/**
 * CRITICAL AUTHENTICATION TEST SUITE
 * Added after blank screen incident - MUST PASS before any deployment
 * 
 * This test suite specifically checks for the issues that caused
 * the blank screen after login incident.
 */

export interface AuthTestResult {
  testName: string;
  passed: boolean;
  message: string;
  critical: boolean;
  evidence?: any;
}

export class CriticalAuthTest {
  private results: AuthTestResult[] = [];
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
   * Test 1: No process.env references in browser code
   * CRITICAL: process.env doesn't exist in browser, use import.meta.env
   */
  async testNoProcessEnv(): Promise<AuthTestResult> {
    // Check all script tags for process.env
    const scripts = Array.from(document.querySelectorAll('script'));
    const violations: string[] = [];
    
    scripts.forEach(script => {
      const content = script.textContent || '';
      if (content.includes('process.env')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('process.env')) {
            violations.push(`Line ${idx}: ${line.trim()}`);
          }
        });
      }
    });

    // Check inline scripts
    const inlineScripts = document.body.innerHTML.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (inlineScripts) {
      inlineScripts.forEach(script => {
        if (script.includes('process.env')) {
          violations.push('Found in inline script');
        }
      });
    }

    return {
      testName: 'No process.env in browser',
      passed: violations.length === 0,
      message: violations.length > 0 
        ? `Found ${violations.length} process.env references (use import.meta.env instead)`
        : 'No process.env references found',
      critical: true,
      evidence: violations
    };
  }

  /**
   * Test 2: Profile loading in demo mode
   * CRITICAL: Must handle demo mode when Supabase not configured
   */
  async testDemoModeProfile(): Promise<AuthTestResult> {
    const isDemoMode = !import.meta.env?.VITE_SUPABASE_URL || 
                       import.meta.env?.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (!isDemoMode) {
      return {
        testName: 'Demo Mode Profile',
        passed: true,
        message: 'Not in demo mode - Supabase configured',
        critical: false
      };
    }

    // In demo mode, check if profile can be created/loaded
    const demoAuth = localStorage.getItem('mythatron_demo_auth');
    const profile = localStorage.getItem('mythatron_profile');
    
    if (demoAuth === 'true' && !profile) {
      return {
        testName: 'Demo Mode Profile',
        passed: false,
        message: 'Demo auth active but no profile created',
        critical: true
      };
    }

    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        if (!parsed.user_id || !parsed.username) {
          return {
            testName: 'Demo Mode Profile',
            passed: false,
            message: 'Invalid profile structure',
            critical: true,
            evidence: parsed
          };
        }
      } catch (e) {
        return {
          testName: 'Demo Mode Profile',
          passed: false,
          message: 'Profile JSON parse error',
          critical: true,
          evidence: e
        };
      }
    }

    return {
      testName: 'Demo Mode Profile',
      passed: true,
      message: 'Demo mode profile handling works',
      critical: false
    };
  }

  /**
   * Test 3: Event handler type safety
   * CRITICAL: Must check if event.target is HTMLElement before using
   */
  async testEventHandlerSafety(): Promise<AuthTestResult> {
    const errors = this.consoleErrors.filter(err => 
      err.includes('target.closest is not a function') ||
      err.includes('Cannot read properties of undefined')
    );

    return {
      testName: 'Event Handler Type Safety',
      passed: errors.length === 0,
      message: errors.length > 0
        ? `Found ${errors.length} type safety errors in event handlers`
        : 'Event handlers properly type-checked',
      critical: true,
      evidence: errors
    };
  }

  /**
   * Test 4: Error boundary not triggered
   * CRITICAL: Error boundary means app crashed
   */
  async testNoErrorBoundary(): Promise<AuthTestResult> {
    const errorBoundary = document.querySelector('[data-testid="error-boundary"]');
    const errorHeading = Array.from(document.querySelectorAll('h2'))
      .find(h => h.textContent?.toLowerCase().includes('oops') || 
                 h.textContent?.toLowerCase().includes('error'));
    
    const hasError = errorBoundary || errorHeading;

    return {
      testName: 'No Error Boundary',
      passed: !hasError,
      message: hasError
        ? 'Error boundary triggered - app crashed'
        : 'No error boundary detected',
      critical: true,
      evidence: errorHeading?.textContent
    };
  }

  /**
   * Test 5: Dashboard loads after auth
   * CRITICAL: User must see dashboard after login
   */
  async testDashboardLoads(): Promise<AuthTestResult> {
    const isAuthenticated = localStorage.getItem('mythatron_demo_auth') === 'true' ||
                           sessionStorage.getItem('sb-auth-token');
    
    if (!isAuthenticated) {
      return {
        testName: 'Dashboard After Auth',
        passed: true,
        message: 'Not authenticated - test skipped',
        critical: false
      };
    }

    const dashboardElements = [
      document.querySelector('[data-testid="dashboard"]'),
      document.querySelector('.command-center'),
      document.body.innerText.includes('COMMAND CENTER'),
      document.body.innerText.includes('QUICK LAUNCH')
    ];

    const hasDashboard = dashboardElements.some(el => !!el);

    return {
      testName: 'Dashboard After Auth',
      passed: hasDashboard,
      message: hasDashboard
        ? 'Dashboard loaded successfully'
        : 'Dashboard not found after authentication',
      critical: true
    };
  }

  /**
   * Test 6: Console errors check
   * CRITICAL: Specific errors that break auth
   */
  async testNoAuthErrors(): Promise<AuthTestResult> {
    const criticalErrors = [
      'process is not defined',
      'Cannot read properties of null',
      'Cannot read properties of undefined',
      'useAuth must be used within',
      'Failed to load profile',
      'Supabase client error',
      'ReferenceError',
      'TypeError'
    ];

    const foundErrors = this.consoleErrors.filter(err => 
      criticalErrors.some(critical => err.includes(critical))
    );

    return {
      testName: 'No Auth Console Errors',
      passed: foundErrors.length === 0,
      message: foundErrors.length > 0
        ? `Found ${foundErrors.length} critical console errors`
        : 'No critical console errors',
      critical: true,
      evidence: foundErrors.slice(0, 3) // First 3 errors
    };
  }

  /**
   * Test 7: Environment variables configured
   * CRITICAL: Must use Vite's import.meta.env
   */
  async testEnvironmentVars(): Promise<AuthTestResult> {
    try {
      // Try to access import.meta.env directly
      const hasViteEnv = import.meta && import.meta.env;
      
      if (!hasViteEnv) {
        return {
          testName: 'Environment Variables',
          passed: false,
          message: 'import.meta.env not available - Vite not configured',
          critical: true
        };
      }

      return {
        testName: 'Environment Variables',
        passed: true,
        message: 'Vite environment variables properly configured',
        critical: false
      };
    } catch (error) {
      // If import.meta throws an error, we're not in an ES module context
      return {
        testName: 'Environment Variables',
        passed: false,
        message: 'import.meta not available - not in ES module context',
        critical: true
      };
    }
  }

  /**
   * Test 8: Admin privileges work
   * CRITICAL: Admin users must get proper privileges
   */
  async testAdminPrivileges(): Promise<AuthTestResult> {
    const userEmail = localStorage.getItem('mythatron_user_email');
    const isSupremeAdmin = userEmail === 'justincronk@pm.me';
    
    if (!isSupremeAdmin) {
      return {
        testName: 'Admin Privileges',
        passed: true,
        message: 'Not admin user - test skipped',
        critical: false
      };
    }

    const sparks = localStorage.getItem('mythatron_sparks');
    const hasInfiniteSparks = sparks === 'Infinity';
    const hasTestButton = document.body.innerText.includes('OPUS 4.1 TEST PROTOCOL') ||
                         document.body.innerText.includes('RUN COMPREHENSIVE TEST');

    return {
      testName: 'Admin Privileges',
      passed: hasInfiniteSparks && hasTestButton,
      message: hasInfiniteSparks && hasTestButton
        ? 'Admin privileges working correctly'
        : `Admin privileges incomplete - Sparks: ${sparks}, Test button: ${hasTestButton}`,
      critical: true
    };
  }

  /**
   * Run all critical auth tests
   */
  async runAllTests(): Promise<{
    passed: boolean;
    critical: number;
    total: number;
    results: AuthTestResult[];
  }> {
    console.log('🔐 CRITICAL AUTHENTICATION TEST SUITE');
    console.log('=' .repeat(60));
    
    this.results = [];
    
    // Run all tests
    this.results.push(await this.testNoProcessEnv());
    this.results.push(await this.testDemoModeProfile());
    this.results.push(await this.testEventHandlerSafety());
    this.results.push(await this.testNoErrorBoundary());
    this.results.push(await this.testDashboardLoads());
    this.results.push(await this.testNoAuthErrors());
    this.results.push(await this.testEnvironmentVars());
    this.results.push(await this.testAdminPrivileges());

    // Calculate results
    const critical = this.results.filter(r => r.critical);
    const criticalPassed = critical.filter(r => r.passed);
    const allPassed = this.results.every(r => r.passed);

    // Log results
    console.log('\n📊 TEST RESULTS:');
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const critical = result.critical ? ' [CRITICAL]' : '';
      console.log(`${icon} ${result.testName}${critical}: ${result.message}`);
      if (result.evidence && !result.passed) {
        console.log('   Evidence:', result.evidence);
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log(`CRITICAL TESTS: ${criticalPassed.length}/${critical.length} passed`);
    console.log(`TOTAL: ${this.results.filter(r => r.passed).length}/${this.results.length} passed`);
    console.log(`STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);

    // Restore console.error
    console.error = this.originalConsoleError;

    return {
      passed: allPassed,
      critical: criticalPassed.length,
      total: this.results.length,
      results: this.results
    };
  }

  /**
   * Quick check - run only critical tests
   */
  async quickCheck(): Promise<boolean> {
    const critical = [
      await this.testNoProcessEnv(),
      await this.testNoErrorBoundary(),
      await this.testNoAuthErrors()
    ];

    return critical.every(r => r.passed);
  }
}

// Export for use in other tests
export default CriticalAuthTest;
