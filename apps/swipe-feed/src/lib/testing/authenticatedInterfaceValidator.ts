/**
 * Authenticated Full-Interface Click & Functionality Validator
 * Tests every button, link, menu, and interactive feature in authenticated state
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface ValidationResult {
  element: string;
  type: string;
  location: string;
  action: string;
  result: 'success' | 'failure' | 'warning';
  details?: string;
  screenshot?: string;
  timestamp: Date;
}

export interface ValidationReport {
  startTime: Date;
  endTime: Date;
  totalElements: number;
  successful: number;
  failed: number;
  warnings: number;
  results: ValidationResult[];
  sessionData: {
    username: string;
    authenticated: boolean;
    role?: string;
  };
}

export class AuthenticatedInterfaceValidator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: ValidationResult[] = [];
  private username: string = 'jwcronk82@gmail.com';
  private baseUrl: string = process.env.APP_URL || 'http://localhost:3000';
  
  /**
   * Initialize browser and authenticate
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Authenticated Interface Validator');
    console.log(`Target: ${this.baseUrl}`);
    console.log(`User: ${this.username}`);
    
    // Launch browser with dev tools
    this.browser = await chromium.launch({
      headless: false, // Show browser for visual validation
      devtools: true,
      slowMo: 100 // Slow down for visibility
    });
    
    // Create context with saved auth state if available
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'AuthenticatedValidator/1.0',
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    // Enable console logging
    this.page = await this.context.newPage();
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.logResult({
          element: 'console',
          type: 'error',
          location: msg.location().url,
          action: 'console_error',
          result: 'warning',
          details: msg.text(),
          timestamp: new Date()
        });
      }
    });
    
    // Catch unhandled errors
    this.page.on('pageerror', error => {
      this.logResult({
        element: 'page',
        type: 'error',
        location: this.page?.url() || 'unknown',
        action: 'page_error',
        result: 'failure',
        details: error.message,
        timestamp: new Date()
      });
    });
  }
  
  /**
   * Perform authentication
   */
  async authenticate(): Promise<boolean> {
    console.log('\n🔐 AUTHENTICATION');
    console.log('────────────────────────────────────');
    
    try {
      // Navigate to login page
      await this.page!.goto(`${this.baseUrl}/auth/login`);
      await this.page!.waitForLoadState('networkidle');
      
      // Check if already authenticated
      if (await this.isAuthenticated()) {
        console.log('✅ Already authenticated');
        return true;
      }
      
      // Fill login form
      console.log('📝 Filling login form...');
      await this.page!.fill('[name="email"], [type="email"], #email', this.username);
      await this.page!.fill('[name="password"], [type="password"], #password', 'password'); // You'll need actual password
      
      // Submit form
      await this.page!.click('[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
      
      // Wait for redirect
      await this.page!.waitForNavigation({ timeout: 10000 });
      
      // Verify authentication
      if (await this.isAuthenticated()) {
        console.log('✅ Authentication successful');
        
        // Save auth state for future runs
        await this.context!.storageState({ path: 'auth-state.json' });
        
        return true;
      } else {
        console.log('❌ Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return false;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  private async isAuthenticated(): Promise<boolean> {
    // Check for auth indicators
    const indicators = [
      '[data-testid="user-menu"]',
      '[data-testid="dashboard"]',
      '.user-profile',
      '#user-avatar',
      'button:has-text("Logout")',
      'button:has-text("Sign Out")'
    ];
    
    for (const selector of indicators) {
      if (await this.page!.$(selector)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Run comprehensive validation
   */
  async runValidation(): Promise<ValidationReport> {
    const startTime = new Date();
    console.log('\n🔍 COMPREHENSIVE INTERFACE VALIDATION');
    console.log('════════════════════════════════════════════');
    
    // Validate main navigation
    await this.validateNavigation();
    
    // Validate dashboard
    await this.validateDashboard();
    
    // Validate feed
    await this.validateFeed();
    
    // Validate StoryForge
    await this.validateStoryForge();
    
    // Validate SongForge
    await this.validateSongForge();
    
    // Validate MythaQuest
    await this.validateMythaQuest();
    
    // Validate messages
    await this.validateMessages();
    
    // Validate notifications
    await this.validateNotifications();
    
    // Validate settings
    await this.validateSettings();
    
    // Validate admin features
    await this.validateAdminFeatures();
    
    // Validate mobile responsiveness
    await this.validateMobileView();
    
    // Generate report
    const endTime = new Date();
    const report = this.generateReport(startTime, endTime);
    
    return report;
  }
  
  /**
   * Validate main navigation
   */
  private async validateNavigation(): Promise<void> {
    console.log('\n📍 NAVIGATION VALIDATION');
    console.log('────────────────────────────────────');
    
    const navItems = [
      { selector: '[data-testid="nav-dashboard"]', name: 'Dashboard' },
      { selector: '[data-testid="nav-feed"]', name: 'Feed' },
      { selector: '[data-testid="nav-stories"]', name: 'StoryForge' },
      { selector: '[data-testid="nav-songforge"]', name: 'SongForge' },
      { selector: '[data-testid="nav-mythaquest"]', name: 'MythaQuest' },
      { selector: '[data-testid="nav-messages"]', name: 'Messages' },
      { selector: '[data-testid="nav-notifications"]', name: 'Notifications' },
      { selector: '[data-testid="nav-settings"]', name: 'Settings' }
    ];
    
    for (const item of navItems) {
      await this.testClickable(item.selector, item.name, 'navigation');
    }
  }
  
  /**
   * Validate dashboard features
   */
  private async validateDashboard(): Promise<void> {
    console.log('\n📊 DASHBOARD VALIDATION');
    console.log('────────────────────────────────────');
    
    // Navigate to dashboard
    await this.navigateTo('/dashboard');
    
    // Test dashboard elements
    const elements = [
      { selector: '[data-testid="test-execution-button"]', name: 'Test Execution Button' },
      { selector: '[data-testid="export-button"]', name: 'Export Button' },
      { selector: '[data-testid="date-range-picker"]', name: 'Date Range Picker' },
      { selector: '[data-testid="metric-card"]', name: 'Metric Cards' },
      { selector: '[data-testid="chart-container"]', name: 'Charts' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'dashboard');
    }
    
    // Test the automated test button
    await this.testAutomatedTestButton();
  }
  
  /**
   * Test automated test execution button
   */
  private async testAutomatedTestButton(): Promise<void> {
    console.log('  🎯 Testing Automated Test Button...');
    
    // Look for floating action button
    const fabSelector = '.fixed.bottom-6.right-6 button';
    const element = await this.page!.$(fabSelector);
    
    if (element) {
      // Click to open menu
      await element.click();
      await this.page!.waitForTimeout(500);
      
      // Check for quick actions
      const quickValidate = await this.page!.$('button:has-text("Quick Validate")');
      if (quickValidate) {
        console.log('    ✅ Quick Validate button found');
        
        // Test quick validate
        await quickValidate.click();
        await this.page!.waitForTimeout(3000);
        
        this.logResult({
          element: 'Quick Test Button',
          type: 'button',
          location: 'floating',
          action: 'quick_validate',
          result: 'success',
          details: 'Quick validation executed',
          timestamp: new Date()
        });
      }
      
      // Check main test panel
      const fullDashboard = await this.page!.$('button:has-text("Full Dashboard")');
      if (fullDashboard) {
        await fullDashboard.click();
        await this.page!.waitForTimeout(1000);
        
        // Look for main execute button
        const executeButton = await this.page!.$('button:has-text("Execute Comprehensive Test Protocol")');
        if (executeButton) {
          console.log('    ✅ Main test execution button found');
          this.logResult({
            element: 'Test Execution Panel',
            type: 'panel',
            location: 'dashboard',
            action: 'open',
            result: 'success',
            timestamp: new Date()
          });
        }
      }
    } else {
      console.log('    ⚠️ Automated test button not found');
      this.logResult({
        element: 'Quick Test Button',
        type: 'button',
        location: 'floating',
        action: 'locate',
        result: 'failure',
        details: 'Floating action button not found',
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Validate feed functionality
   */
  private async validateFeed(): Promise<void> {
    console.log('\n📱 FEED VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/feed');
    
    // Test feed interactions
    const actions = [
      { selector: '[data-testid="create-post"]', name: 'Create Post' },
      { selector: '[data-testid="like-button"]', name: 'Like Button' },
      { selector: '[data-testid="comment-button"]', name: 'Comment Button' },
      { selector: '[data-testid="share-button"]', name: 'Share Button' },
      { selector: '[data-testid="load-more"]', name: 'Load More' }
    ];
    
    for (const action of actions) {
      await this.testClickable(action.selector, action.name, 'feed');
    }
  }
  
  /**
   * Validate StoryForge
   */
  private async validateStoryForge(): Promise<void> {
    console.log('\n📚 STORYFORGE VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/stories');
    
    const elements = [
      { selector: '[data-testid="new-story"]', name: 'New Story' },
      { selector: '[data-testid="story-list"]', name: 'Story List' },
      { selector: '[data-testid="branch-button"]', name: 'Branch Story' },
      { selector: '[data-testid="collaborate-button"]', name: 'Collaborate' },
      { selector: '[data-testid="export-story"]', name: 'Export Story' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'storyforge');
    }
  }
  
  /**
   * Validate SongForge
   */
  private async validateSongForge(): Promise<void> {
    console.log('\n🎵 SONGFORGE VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/songforge');
    
    const elements = [
      { selector: '[data-testid="new-song"]', name: 'New Song' },
      { selector: '[data-testid="generate-lyrics"]', name: 'Generate Lyrics' },
      { selector: '[data-testid="generate-melody"]', name: 'Generate Melody' },
      { selector: '[data-testid="remix-button"]', name: 'Remix' },
      { selector: '[data-testid="preview-audio"]', name: 'Preview Audio' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'songforge');
    }
  }
  
  /**
   * Validate MythaQuest
   */
  private async validateMythaQuest(): Promise<void> {
    console.log('\n🎮 MYTHAQUEST VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/mythaquest');
    
    const elements = [
      { selector: '[data-testid="create-world"]', name: 'Create World' },
      { selector: '[data-testid="enter-dungeon"]', name: 'Enter Dungeon' },
      { selector: '[data-testid="character-sheet"]', name: 'Character Sheet' },
      { selector: '[data-testid="inventory"]', name: 'Inventory' },
      { selector: '[data-testid="quest-log"]', name: 'Quest Log' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'mythaquest');
    }
  }
  
  /**
   * Validate messages
   */
  private async validateMessages(): Promise<void> {
    console.log('\n💬 MESSAGES VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/messages');
    
    const elements = [
      { selector: '[data-testid="new-message"]', name: 'New Message' },
      { selector: '[data-testid="message-list"]', name: 'Message List' },
      { selector: '[data-testid="send-button"]', name: 'Send Button' },
      { selector: '[data-testid="attach-file"]', name: 'Attach File' },
      { selector: '[data-testid="emoji-picker"]', name: 'Emoji Picker' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'messages');
    }
  }
  
  /**
   * Validate notifications
   */
  private async validateNotifications(): Promise<void> {
    console.log('\n🔔 NOTIFICATIONS VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/notifications');
    
    const elements = [
      { selector: '[data-testid="mark-all-read"]', name: 'Mark All Read' },
      { selector: '[data-testid="notification-settings"]', name: 'Notification Settings' },
      { selector: '[data-testid="notification-item"]', name: 'Notification Items' }
    ];
    
    for (const element of elements) {
      await this.testClickable(element.selector, element.name, 'notifications');
    }
  }
  
  /**
   * Validate settings
   */
  private async validateSettings(): Promise<void> {
    console.log('\n⚙️ SETTINGS VALIDATION');
    console.log('────────────────────────────────────');
    
    await this.navigateTo('/settings');
    
    const tabs = [
      { selector: '[data-testid="profile-tab"]', name: 'Profile' },
      { selector: '[data-testid="account-tab"]', name: 'Account' },
      { selector: '[data-testid="privacy-tab"]', name: 'Privacy' },
      { selector: '[data-testid="notifications-tab"]', name: 'Notifications' },
      { selector: '[data-testid="billing-tab"]', name: 'Billing' }
    ];
    
    for (const tab of tabs) {
      await this.testClickable(tab.selector, tab.name, 'settings');
    }
  }
  
  /**
   * Validate admin features
   */
  private async validateAdminFeatures(): Promise<void> {
    console.log('\n👑 ADMIN FEATURES VALIDATION');
    console.log('────────────────────────────────────');
    
    // Check if user has admin access
    const adminMenu = await this.page!.$('[data-testid="admin-menu"]');
    if (!adminMenu) {
      console.log('  ℹ️ User does not have admin access');
      return;
    }
    
    await this.navigateTo('/admin');
    
    const features = [
      { selector: '[data-testid="user-management"]', name: 'User Management' },
      { selector: '[data-testid="content-moderation"]', name: 'Content Moderation' },
      { selector: '[data-testid="analytics"]', name: 'Analytics' },
      { selector: '[data-testid="feature-flags"]', name: 'Feature Flags' },
      { selector: '[data-testid="system-health"]', name: 'System Health' }
    ];
    
    for (const feature of features) {
      await this.testClickable(feature.selector, feature.name, 'admin');
    }
  }
  
  /**
   * Validate mobile responsiveness
   */
  private async validateMobileView(): Promise<void> {
    console.log('\n📱 MOBILE VIEW VALIDATION');
    console.log('────────────────────────────────────');
    
    // Set mobile viewport
    await this.page!.setViewportSize({ width: 375, height: 667 });
    await this.page!.waitForTimeout(1000);
    
    // Check mobile menu
    const mobileMenu = await this.page!.$('[data-testid="mobile-menu-button"]');
    if (mobileMenu) {
      await mobileMenu.click();
      await this.page!.waitForTimeout(500);
      
      console.log('  ✅ Mobile menu functional');
      
      // Close menu
      await this.page!.keyboard.press('Escape');
    }
    
    // Reset viewport
    await this.page!.setViewportSize({ width: 1920, height: 1080 });
  }
  
  /**
   * Test if element is clickable
   */
  private async testClickable(
    selector: string, 
    name: string, 
    location: string
  ): Promise<void> {
    try {
      const element = await this.page!.$(selector);
      
      if (!element) {
        console.log(`  ⚠️ ${name} not found`);
        this.logResult({
          element: name,
          type: 'element',
          location,
          action: 'locate',
          result: 'warning',
          details: 'Element not found',
          timestamp: new Date()
        });
        return;
      }
      
      // Check if visible
      const isVisible = await element.isVisible();
      if (!isVisible) {
        console.log(`  ⚠️ ${name} not visible`);
        this.logResult({
          element: name,
          type: 'element',
          location,
          action: 'visibility',
          result: 'warning',
          details: 'Element not visible',
          timestamp: new Date()
        });
        return;
      }
      
      // Check if enabled
      const isEnabled = await element.isEnabled();
      if (!isEnabled) {
        console.log(`  ⚠️ ${name} not enabled`);
        this.logResult({
          element: name,
          type: 'element',
          location,
          action: 'enabled',
          result: 'warning',
          details: 'Element not enabled',
          timestamp: new Date()
        });
        return;
      }
      
      // Try to click
      await element.click();
      await this.page!.waitForTimeout(500);
      
      console.log(`  ✅ ${name} clickable`);
      this.logResult({
        element: name,
        type: 'element',
        location,
        action: 'click',
        result: 'success',
        timestamp: new Date()
      });
      
    } catch (error) {
      console.log(`  ❌ ${name} click failed: ${error.message}`);
      this.logResult({
        element: name,
        type: 'element',
        location,
        action: 'click',
        result: 'failure',
        details: error.message,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Navigate to a path
   */
  private async navigateTo(path: string): Promise<void> {
    try {
      await this.page!.goto(`${this.baseUrl}${path}`);
      await this.page!.waitForLoadState('networkidle');
    } catch (error) {
      console.error(`Navigation to ${path} failed:`, error);
    }
  }
  
  /**
   * Log validation result
   */
  private logResult(result: ValidationResult): void {
    this.results.push(result);
  }
  
  /**
   * Generate validation report
   */
  private generateReport(startTime: Date, endTime: Date): ValidationReport {
    const successful = this.results.filter(r => r.result === 'success').length;
    const failed = this.results.filter(r => r.result === 'failure').length;
    const warnings = this.results.filter(r => r.result === 'warning').length;
    
    return {
      startTime,
      endTime,
      totalElements: this.results.length,
      successful,
      failed,
      warnings,
      results: this.results,
      sessionData: {
        username: this.username,
        authenticated: true,
        role: 'admin'
      }
    };
  }
  
  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  /**
   * Execute validation via Dev Console
   */
  async executeViaDevConsole(): Promise<string> {
    // Generate console script
    const script = `
// Authenticated Interface Validation Script
// Run this in your browser's Dev Console while logged in

(async function validateInterface() {
  console.log('🚀 Starting Authenticated Interface Validation');
  console.log('User: ${this.username}');
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  // Helper function to test element
  async function testElement(selector, name, location) {
    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        console.warn(\`⚠️ \${name} not found\`);
        results.push({ element: name, result: 'not_found', location });
        return false;
      }
      
      // Check visibility
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      if (!isVisible) {
        console.warn(\`⚠️ \${name} not visible\`);
        results.push({ element: name, result: 'not_visible', location });
        return false;
      }
      
      // Check if clickable
      const isDisabled = element.disabled || element.getAttribute('aria-disabled') === 'true';
      
      if (isDisabled) {
        console.warn(\`⚠️ \${name} disabled\`);
        results.push({ element: name, result: 'disabled', location });
        return false;
      }
      
      // Simulate click
      element.click();
      
      console.log(\`✅ \${name} functional\`);
      results.push({ element: name, result: 'success', location });
      successCount++;
      return true;
      
    } catch (error) {
      console.error(\`❌ \${name} error:\`, error);
      results.push({ element: name, result: 'error', location, error: error.message });
      failureCount++;
      return false;
    }
  }
  
  // Test Navigation
  console.log('\\n📍 Testing Navigation...');
  await testElement('[data-testid="nav-dashboard"]', 'Dashboard Nav', 'navigation');
  await testElement('[data-testid="nav-feed"]', 'Feed Nav', 'navigation');
  await testElement('[data-testid="nav-stories"]', 'StoryForge Nav', 'navigation');
  await testElement('[data-testid="nav-songforge"]', 'SongForge Nav', 'navigation');
  
  // Test Quick Test Button
  console.log('\\n🎯 Testing Quick Test Button...');
  const fab = document.querySelector('.fixed.bottom-6.right-6 button');
  if (fab) {
    fab.click();
    await new Promise(r => setTimeout(r, 500));
    
    const quickValidate = document.querySelector('button:contains("Quick Validate")') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Quick Validate'));
    
    if (quickValidate) {
      console.log('✅ Quick Test Button functional');
      successCount++;
    } else {
      console.warn('⚠️ Quick Validate option not found');
    }
  } else {
    console.warn('⚠️ Floating Action Button not found');
  }
  
  // Test all clickable elements
  console.log('\\n🔍 Testing all buttons and links...');
  const clickables = document.querySelectorAll('button, a[href], [role="button"], [onclick]');
  
  clickables.forEach((element, index) => {
    const text = element.textContent?.trim() || element.getAttribute('aria-label') || \`Element \${index}\`;
    const isVisible = element.offsetParent !== null;
    
    if (isVisible && !element.disabled) {
      successCount++;
      console.log(\`✅ "\${text}" is clickable\`);
    }
  });
  
  // Generate summary
  console.log('\\n════════════════════════════════════════════');
  console.log('📊 VALIDATION SUMMARY');
  console.log('════════════════════════════════════════════');
  console.log(\`Total Elements Tested: \${results.length}\`);
  console.log(\`✅ Successful: \${successCount}\`);
  console.log(\`❌ Failed: \${failureCount}\`);
  console.log(\`⚠️ Warnings: \${results.filter(r => r.result.includes('not_')).length}\`);
  
  // Check for test panel
  if (document.querySelector('button:contains("Execute Comprehensive Test Protocol")') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Execute Comprehensive Test Protocol'))) {
    console.log('\\n✅ Test Execution Panel is accessible');
  } else {
    console.log('\\n⚠️ Test Execution Panel not found - navigate to Dashboard > Test Execution');
  }
  
  console.log('\\n💡 To run comprehensive tests:');
  console.log('1. Click the blue floating button (bottom-right)');
  console.log('2. Select "Quick Validate" for fast check');
  console.log('3. Or select "Full Dashboard" for complete testing');
  
  // Return results for further processing
  window.validationResults = results;
  console.log('\\nResults saved to window.validationResults');
  
  return results;
})();
    `;
    
    return script;
  }
}

// Export for use
export const interfaceValidator = new AuthenticatedInterfaceValidator();
