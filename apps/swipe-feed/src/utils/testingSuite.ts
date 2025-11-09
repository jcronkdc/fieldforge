/**
 * MythaTron Beta Testing Suite
 * Comprehensive testing utilities for beta testing phase
 */

interface TestResult {
  feature: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: Date;
  details?: any;
}

class MythaTronTestSuite {
  private results: TestResult[] = [];
  private startTime: Date | null = null;

  /**
   * Start the test suite
   */
  start() {
    this.results = [];
    this.startTime = new Date();
    console.log('%c🧪 MythaTron Beta Test Suite Started', 'color: #9333ea; font-weight: bold; font-size: 16px');
    console.log(`%cTimestamp: ${this.startTime.toISOString()}`, 'color: #a855f7');
  }

  /**
   * Test authentication flow
   */
  async testAuthentication(): Promise<void> {
    try {
      // Check if Supabase is initialized
      const { supabase } = await import('../lib/supabaseClient');
      if (supabase) {
        this.log('Authentication', 'pass', 'Supabase client initialized');
        
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          this.log('Authentication', 'pass', `User authenticated: ${session.user.email}`);
        } else {
          this.log('Authentication', 'warning', 'No active session');
        }
      }
    } catch (error) {
      this.log('Authentication', 'fail', `Error: ${error}`);
    }
  }

  /**
   * Test API connectivity
   */
  async testAPIConnectivity(): Promise<void> {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      // Test health endpoint
      const response = await fetch(`${apiBase}/health`);
      if (response.ok) {
        const data = await response.json();
        this.log('API Connectivity', 'pass', `Backend connected: ${apiBase}`, data);
      } else {
        this.log('API Connectivity', 'fail', `Backend unreachable: ${response.status}`);
      }
    } catch (error) {
      this.log('API Connectivity', 'fail', `Cannot reach backend: ${error}`);
    }
  }

  /**
   * Test real-time features
   */
  async testRealtime(): Promise<void> {
    try {
      // Check if Ably is configured
      if (import.meta.env.VITE_ABLY_KEY) {
        this.log('Realtime', 'pass', 'Ably key configured');
      } else {
        this.log('Realtime', 'warning', 'Ably key not found - realtime features disabled');
      }
    } catch (error) {
      this.log('Realtime', 'fail', `Realtime test failed: ${error}`);
    }
  }

  /**
   * Test Stripe integration
   */
  async testPayments(): Promise<void> {
    try {
      if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        this.log('Payments', 'pass', 'Stripe publishable key configured');
      } else {
        this.log('Payments', 'warning', 'Stripe not configured - payments disabled');
      }
    } catch (error) {
      this.log('Payments', 'fail', `Payment test failed: ${error}`);
    }
  }

  /**
   * Test storage functionality
   */
  async testStorage(): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      // List buckets (this will fail if storage is not set up)
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        this.log('Storage', 'warning', 'Storage access limited', error);
      } else {
        this.log('Storage', 'pass', `Storage configured: ${data?.length || 0} buckets found`);
      }
    } catch (error) {
      this.log('Storage', 'fail', `Storage test failed: ${error}`);
    }
  }

  /**
   * Test database connectivity
   */
  async testDatabase(): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      // Try to fetch user profile (will work if user is logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          this.log('Database', 'pass', `Database connected - User: ${data.username}`);
        } else if (error) {
          this.log('Database', 'warning', 'Database reachable but query failed', error);
        }
      } else {
        this.log('Database', 'warning', 'Database test skipped - no user session');
      }
    } catch (error) {
      this.log('Database', 'fail', `Database test failed: ${error}`);
    }
  }

  /**
   * Test browser compatibility
   */
  testBrowserCompatibility(): void {
    const features = {
      'WebSocket': typeof WebSocket !== 'undefined',
      'LocalStorage': typeof localStorage !== 'undefined',
      'SessionStorage': typeof sessionStorage !== 'undefined',
      'Fetch API': typeof fetch !== 'undefined',
      'Service Worker': 'serviceWorker' in navigator,
      'Notifications': 'Notification' in window,
      'WebGL': !!document.createElement('canvas').getContext('webgl'),
      'Web Audio': 'AudioContext' in window || 'webkitAudioContext' in window,
    };

    let allPass = true;
    for (const [feature, supported] of Object.entries(features)) {
      if (!supported) {
        this.log('Browser Compatibility', 'warning', `${feature} not supported`);
        allPass = false;
      }
    }

    if (allPass) {
      this.log('Browser Compatibility', 'pass', 'All features supported');
    }
  }

  /**
   * Test performance metrics
   */
  testPerformance(): void {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      const metrics = {
        'Page Load Time': `${loadTime}ms`,
        'DOM Ready Time': `${domReadyTime}ms`,
        'Memory Usage': (performance as any).memory ? 
          `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB` : 'N/A'
      };

      if (loadTime < 3000) {
        this.log('Performance', 'pass', 'Good performance metrics', metrics);
      } else if (loadTime < 5000) {
        this.log('Performance', 'warning', 'Moderate performance', metrics);
      } else {
        this.log('Performance', 'fail', 'Poor performance', metrics);
      }
    }
  }

  /**
   * Log a test result
   */
  private log(feature: string, status: TestResult['status'], message: string, details?: any) {
    const result: TestResult = {
      feature,
      status,
      message,
      timestamp: new Date(),
      details
    };
    
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    const color = status === 'pass' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
    
    console.log(`%c${emoji} ${feature}: ${message}`, `color: ${color}`);
    if (details) {
      console.log('   Details:', details);
    }
  }

  /**
   * Run all tests
   */
  async runAll(): Promise<void> {
    this.start();
    
    // Run tests in sequence
    await this.testAuthentication();
    await this.testAPIConnectivity();
    await this.testDatabase();
    await this.testStorage();
    await this.testRealtime();
    await this.testPayments();
    this.testBrowserCompatibility();
    this.testPerformance();
    
    this.generateReport();
  }

  /**
   * Generate test report
   */
  generateReport(): void {
    const endTime = new Date();
    const duration = this.startTime ? endTime.getTime() - this.startTime.getTime() : 0;
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log('%c═══════════════════════════════════════', 'color: #9333ea');
    console.log('%c📊 MythaTron Beta Test Results', 'color: #9333ea; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════', 'color: #9333ea');
    
    console.log(`%c✅ Passed: ${passed}`, 'color: #10b981; font-weight: bold');
    console.log(`%c⚠️  Warnings: ${warnings}`, 'color: #f59e0b; font-weight: bold');
    console.log(`%c❌ Failed: ${failed}`, 'color: #ef4444; font-weight: bold');
    console.log(`%c⏱️  Duration: ${duration}ms`, 'color: #6b7280');
    
    if (failed === 0 && warnings < 3) {
      console.log('%c🎉 System ready for beta testing!', 'color: #10b981; font-size: 14px; font-weight: bold');
    } else if (failed === 0) {
      console.log('%c⚡ System functional with minor issues', 'color: #f59e0b; font-size: 14px; font-weight: bold');
    } else {
      console.log('%c🔧 Critical issues detected - review needed', 'color: #ef4444; font-size: 14px; font-weight: bold');
    }
    
    // Store results for debugging
    (window as any).__MYTHATRON_TEST_RESULTS__ = this.results;
    console.log('%cFull results available at: window.__MYTHATRON_TEST_RESULTS__', 'color: #6b7280; font-style: italic');
  }
}

// Export singleton instance
export const testSuite = new MythaTronTestSuite();

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Wait for app to initialize
  setTimeout(() => {
    console.log('%c🔬 Running automated beta tests...', 'color: #9333ea');
    testSuite.runAll();
  }, 3000);
}
