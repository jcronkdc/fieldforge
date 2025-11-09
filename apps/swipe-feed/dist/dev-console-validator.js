/**
 * AUTHENTICATED INTERFACE VALIDATOR
 * Copy and paste this entire script into your browser's Dev Console
 * while logged in as jwcronk82@gmail.com
 */

console.clear();
console.log('%c🔐 AUTHENTICATED INTERFACE VALIDATOR', 'font-size: 20px; font-weight: bold; color: #4CAF50');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666');
console.log('User: jwcronk82@gmail.com');
console.log('Starting comprehensive validation...\n');

// Global results storage
window.validationResults = {
  timestamp: new Date().toISOString(),
  user: 'jwcronk82@gmail.com',
  elements: [],
  summary: {
    total: 0,
    successful: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper: Add result
function addResult(element, location, status, details = '') {
  const result = {
    element,
    location,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  
  window.validationResults.elements.push(result);
  window.validationResults.summary.total++;
  
  if (status === 'success') {
    window.validationResults.summary.successful++;
    console.log(`%c✅ ${element}`, 'color: #4CAF50', details);
  } else if (status === 'failure') {
    window.validationResults.summary.failed++;
    console.log(`%c❌ ${element}`, 'color: #f44336', details);
  } else if (status === 'warning') {
    window.validationResults.summary.warnings++;
    console.log(`%c⚠️ ${element}`, 'color: #ff9800', details);
  }
}

// Helper: Test element clickability
function testElement(selector, name, location) {
  try {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) {
      addResult(name, location, 'warning', 'Element not found');
      return false;
    }
    
    let clickableCount = 0;
    elements.forEach(element => {
      // Check visibility
      const style = window.getComputedStyle(element);
      const isHidden = style.display === 'none' || style.visibility === 'hidden';
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.width > 0 && rect.height > 0;
      
      if (!isHidden && isInViewport) {
        // Check if disabled
        const isDisabled = element.disabled || 
                          element.getAttribute('aria-disabled') === 'true' ||
                          element.classList.contains('disabled');
        
        if (!isDisabled) {
          clickableCount++;
          // Highlight element briefly
          const originalBorder = element.style.border;
          element.style.border = '2px solid #4CAF50';
          setTimeout(() => {
            element.style.border = originalBorder;
          }, 500);
        }
      }
    });
    
    if (clickableCount > 0) {
      addResult(name, location, 'success', `${clickableCount} clickable instance(s)`);
      return true;
    } else {
      addResult(name, location, 'warning', 'No clickable instances');
      return false;
    }
    
  } catch (error) {
    addResult(name, location, 'failure', error.message);
    return false;
  }
}

// Helper: Navigate and test
async function navigateAndTest(path, testFunction) {
  if (window.location.pathname !== path) {
    console.log(`%c📍 Navigating to ${path}...`, 'color: #2196F3');
    window.location.pathname = path;
    // Note: Page will reload, tests need to be continued after navigation
    return false;
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  return testFunction();
}

// Test: Authentication Status
function testAuthentication() {
  console.log('%c\n🔐 AUTHENTICATION CHECK', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  const authIndicators = [
    { selector: '[data-testid="user-menu"]', name: 'User Menu' },
    { selector: 'button:contains("Logout"), button:contains("Sign Out")', name: 'Logout Button' },
    { selector: '#user-avatar, .user-avatar, img[alt*="avatar"]', name: 'User Avatar' }
  ];
  
  let isAuthenticated = false;
  authIndicators.forEach(indicator => {
    const element = document.querySelector(indicator.selector) ||
                   Array.from(document.querySelectorAll('button')).find(b => 
                     b.textContent?.includes('Logout') || b.textContent?.includes('Sign Out')
                   );
    
    if (element) {
      isAuthenticated = true;
      addResult(indicator.name, 'auth', 'success', 'Found');
    }
  });
  
  if (!isAuthenticated) {
    console.log('%c⚠️ Not authenticated! Please login first.', 'color: #ff9800; font-size: 16px');
    return false;
  }
  
  console.log('%c✅ User is authenticated', 'color: #4CAF50');
  return true;
}

// Test: Navigation Menu
function testNavigation() {
  console.log('%c\n📍 NAVIGATION MENU', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  const navItems = [
    { selector: '[href="/dashboard"], a:contains("Dashboard")', name: 'Dashboard Link' },
    { selector: '[href="/feed"], a:contains("Feed")', name: 'Feed Link' },
    { selector: '[href="/stories"], a:contains("StoryForge")', name: 'StoryForge Link' },
    { selector: '[href="/songforge"], a:contains("SongForge")', name: 'SongForge Link' },
    { selector: '[href="/mythaquest"], a:contains("MythaQuest")', name: 'MythaQuest Link' },
    { selector: '[href="/messages"], a:contains("Messages")', name: 'Messages Link' },
    { selector: '[href="/notifications"], a:contains("Notifications")', name: 'Notifications Link' },
    { selector: '[href="/settings"], a:contains("Settings")', name: 'Settings Link' }
  ];
  
  navItems.forEach(item => {
    testElement(item.selector, item.name, 'navigation');
  });
}

// Test: Quick Test Button
function testQuickTestButton() {
  console.log('%c\n🎯 QUICK TEST BUTTON', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  // Look for floating action button
  const fab = document.querySelector('.fixed.bottom-6.right-6 button');
  
  if (fab) {
    addResult('Floating Test Button', 'quick-test', 'success', 'Found and visible');
    
    // Click to reveal menu
    fab.click();
    
    setTimeout(() => {
      const quickValidate = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Quick Validate'));
      
      if (quickValidate) {
        addResult('Quick Validate Option', 'quick-test', 'success', 'Menu accessible');
        // Close menu
        document.body.click();
      } else {
        addResult('Quick Validate Option', 'quick-test', 'warning', 'Not found in menu');
      }
    }, 500);
    
  } else {
    addResult('Floating Test Button', 'quick-test', 'warning', 'Not found - may need admin access');
  }
}

// Test: Dashboard Elements
function testDashboard() {
  console.log('%c\n📊 DASHBOARD ELEMENTS', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  if (!window.location.pathname.includes('dashboard')) {
    console.log('ℹ️ Not on dashboard page, skipping...');
    return;
  }
  
  const elements = [
    { selector: 'button:contains("Execute Comprehensive Test Protocol")', name: 'Test Execution Button' },
    { selector: 'button:contains("Export")', name: 'Export Buttons' },
    { selector: '[data-testid="metric-card"], .metric-card', name: 'Metric Cards' },
    { selector: 'canvas, svg.chart', name: 'Charts' },
    { selector: 'input[type="date"]', name: 'Date Pickers' }
  ];
  
  elements.forEach(element => {
    const el = document.querySelector(element.selector) ||
               Array.from(document.querySelectorAll('button'))
                 .find(b => b.textContent?.includes(element.name.replace(' Buttons', '')));
    
    if (el) {
      testElement(element.selector, element.name, 'dashboard');
    }
  });
}

// Test: All Interactive Elements
function testAllInteractiveElements() {
  console.log('%c\n🔍 ALL INTERACTIVE ELEMENTS', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  const selectors = {
    buttons: 'button:not([disabled])',
    links: 'a[href]:not([disabled])',
    inputs: 'input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
    clickables: '[role="button"]:not([aria-disabled="true"]), [onclick]'
  };
  
  Object.entries(selectors).forEach(([type, selector]) => {
    const elements = document.querySelectorAll(selector);
    const visible = Array.from(elements).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    
    if (visible.length > 0) {
      addResult(`${type} (${visible.length} found)`, 'interactive', 'success', `${visible.length} clickable`);
    }
  });
}

// Test: Mobile Menu
function testMobileMenu() {
  console.log('%c\n📱 MOBILE MENU', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  const menuButton = document.querySelector('[data-testid="mobile-menu"], [aria-label*="menu"], button svg.menu-icon');
  
  if (menuButton) {
    addResult('Mobile Menu Button', 'mobile', 'success', 'Found');
  } else {
    addResult('Mobile Menu Button', 'mobile', 'warning', 'Not visible at current viewport');
  }
}

// Test: Sparks Display
function testSparksDisplay() {
  console.log('%c\n✨ SPARKS DISPLAY', 'font-size: 14px; font-weight: bold');
  console.log('%c────────────────────────', 'color: #666');
  
  const sparksElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent?.includes('Sparks') || 
    el.textContent?.match(/\d+\s*Sparks/) ||
    el.className?.includes('sparks')
  );
  
  if (sparksElements.length > 0) {
    addResult('Sparks Balance Display', 'sparks', 'success', `${sparksElements.length} element(s) found`);
    
    // Try to find the actual balance
    const balanceElement = sparksElements.find(el => el.textContent?.match(/\d+/));
    if (balanceElement) {
      const balance = balanceElement.textContent.match(/\d+/)?.[0];
      console.log(`%c   Current balance: ${balance} Sparks`, 'color: #ffc107');
    }
  } else {
    addResult('Sparks Balance Display', 'sparks', 'warning', 'Not found');
  }
}

// Main execution
async function runValidation() {
  // Check authentication
  if (!testAuthentication()) {
    console.log('\n%c⚠️ Please login and run this script again.', 'color: #ff9800; font-size: 16px');
    return;
  }
  
  // Run tests
  testNavigation();
  testQuickTestButton();
  testDashboard();
  testAllInteractiveElements();
  testMobileMenu();
  testSparksDisplay();
  
  // Generate summary
  console.log('%c\n════════════════════════════════════════════════════════', 'color: #666');
  console.log('%c📊 VALIDATION SUMMARY', 'font-size: 16px; font-weight: bold');
  console.log('%c════════════════════════════════════════════════════════', 'color: #666');
  
  const summary = window.validationResults.summary;
  console.log(`Total Elements Tested: ${summary.total}`);
  console.log(`%c✅ Successful: ${summary.successful}`, 'color: #4CAF50');
  console.log(`%c❌ Failed: ${summary.failed}`, 'color: #f44336');
  console.log(`%c⚠️ Warnings: ${summary.warnings}`, 'color: #ff9800');
  
  const successRate = ((summary.successful / summary.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (successRate >= 80) {
    console.log('%c✅ Interface validation PASSED', 'color: #4CAF50; font-size: 16px; font-weight: bold');
  } else if (successRate >= 60) {
    console.log('%c⚠️ Interface validation PARTIAL', 'color: #ff9800; font-size: 16px; font-weight: bold');
  } else {
    console.log('%c❌ Interface validation FAILED', 'color: #f44336; font-size: 16px; font-weight: bold');
  }
  
  // Instructions
  console.log('\n%c💡 NEXT STEPS:', 'font-size: 14px; font-weight: bold; color: #2196F3');
  console.log('1. To test the Quick Test Button: Look for the blue circle in bottom-right corner');
  console.log('2. To run comprehensive tests: Click the button and select "Execute Comprehensive Test Protocol"');
  console.log('3. To export results: Type "copy(JSON.stringify(window.validationResults))" and paste into a file');
  console.log('4. To test specific pages: Navigate to them and run this script again');
  
  console.log('\n%cValidation results saved to: window.validationResults', 'color: #666');
  
  return window.validationResults;
}

// Execute validation
runValidation();

// Add keyboard shortcut for quick re-run
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'V') {
    console.clear();
    runValidation();
  }
});

console.log('\n%cTip: Press Ctrl+Shift+V to re-run validation', 'color: #666; font-style: italic');
