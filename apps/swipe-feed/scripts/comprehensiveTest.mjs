import { chromium } from 'playwright';

async function runComprehensiveTests() {
  const baseUrl = process.argv[2] ?? 'http://localhost:5173';
  
  console.log('🧪 FieldForge Comprehensive Test Suite');
  console.log('Testing URL:', baseUrl);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const results = {
    pages: {},
    design: { passed: true, issues: [] },
    performance: {},
    errors: []
  };

  page.on('pageerror', (error) => {
    results.errors.push(error.message);
  });

  try {
    // Test 1: Landing Page
    console.log('1️⃣  Testing Landing Page...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const landingContent = await page.content();
    const hasFieldForge = landingContent.includes('FieldForge');
    const hasHero = landingContent.includes('operating picture') || landingContent.includes('T&D');
    const hasMain = await page.locator('main').count() > 0;
    const hasCTA = await page.locator('button').count() > 0;
    
    results.pages.landing = {
      passed: hasFieldForge && hasHero && hasMain && hasCTA,
      checks: {
        branding: hasFieldForge,
        hero: hasHero,
        main: hasMain,
        cta: hasCTA
      }
    };
    
    console.log(`   ${results.pages.landing.passed ? '✅' : '❌'} Landing page`);

    // Test 2: Login Page
    console.log('2️⃣  Testing Login Page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;
    const hasSignupLink = await page.locator('a[href*="signup"]').count() > 0;
    
    results.pages.login = {
      passed: hasEmailInput && hasPasswordInput && hasSubmitButton,
      checks: {
        emailInput: hasEmailInput,
        passwordInput: hasPasswordInput,
        submitButton: hasSubmitButton,
        signupLink: hasSignupLink
      }
    };
    
    console.log(`   ${results.pages.login.passed ? '✅' : '❌'} Login page`);

    // Test 3: Signup Page
    console.log('3️⃣  Testing Signup Page...');
    await page.goto(`${baseUrl}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const signupContent = await page.content();
    const hasSignupForm = signupContent.includes('Sign Up') || signupContent.includes('Create') || signupContent.includes('Register');
    const hasInputs = await page.locator('input').count() >= 3;
    
    results.pages.signup = {
      passed: hasSignupForm && hasInputs,
      checks: {
        form: hasSignupForm,
        inputs: hasInputs
      }
    };
    
    console.log(`   ${results.pages.signup.passed ? '✅' : '❌'} Signup page`);

    // Test 4: Design Audit
    console.log('4️⃣  Auditing Design Consistency...');
    
    // Check landing page design
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const sparkles = await page.locator('.animate-float').count();
    if (sparkles > 0) {
      results.design.issues.push(`Landing: ${sparkles} floating sparkle animations still present`);
      results.design.passed = false;
    }
    
    const pulseElements = await page.locator('.animate-pulse').count();
    if (pulseElements > 15) {
      results.design.issues.push(`Landing: ${pulseElements} pulse animations (should be < 15)`);
      results.design.passed = false;
    }
    
    const gradients = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="gradient"]');
      return elements.length;
    });
    
    if (gradients > 60) {
      results.design.issues.push(`Landing: ${gradients} gradient elements (excessive)`);
      results.design.passed = false;
    }

    // Check login page design
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const loginParticles = await page.evaluate(() => {
      const particles = document.querySelectorAll('[class*="particle"]');
      return particles.length;
    });
    
    if (loginParticles > 20) {
      results.design.issues.push(`Login: ${loginParticles} particle elements (should be minimal)`);
      results.design.passed = false;
    }

    console.log(`   ${results.design.passed ? '✅' : '⚠️ '} Design consistency`);
    if (!results.design.passed) {
      results.design.issues.forEach(issue => console.log(`      - ${issue}`));
    }

    // Test 5: Performance Check
    console.log('5️⃣  Checking Performance...');
    await page.goto(baseUrl, { waitUntil: 'load' });
    
    const perfMetrics = await page.evaluate(() => {
      const [navEntry] = performance.getEntriesByType('navigation');
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {
        domInteractive: navEntry?.domInteractive ?? 0,
        domComplete: navEntry?.domComplete ?? 0,
        loadTime: navEntry?.loadEventEnd ?? 0,
        fcp: fcp?.startTime ?? 0
      };
    });
    
    results.performance = perfMetrics;
    const perfPassed = perfMetrics.loadTime < 3000 && perfMetrics.fcp < 2000;
    
    console.log(`   ${perfPassed ? '✅' : '⚠️ '} Performance`);
    console.log(`      - FCP: ${Math.round(perfMetrics.fcp)}ms`);
    console.log(`      - Load: ${Math.round(perfMetrics.loadTime)}ms`);

    // Test 6: Check for JavaScript Errors
    console.log('6️⃣  Checking for JavaScript Errors...');
    console.log(`   ${results.errors.length === 0 ? '✅' : '❌'} No runtime errors (${results.errors.length} found)`);
    if (results.errors.length > 0) {
      results.errors.slice(0, 3).forEach(err => console.log(`      - ${err}`));
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(70));
  
  const allPagesPassed = Object.values(results.pages).every(p => p.passed);
  
  console.log(`Pages:        ${allPagesPassed ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
  Object.entries(results.pages).forEach(([name, result]) => {
    console.log(`  - ${name}: ${result.passed ? '✅' : '❌'}`);
  });
  
  console.log(`Design:       ${results.design.passed ? '✅ PASS' : '⚠️  ISSUES FOUND'}`);
  console.log(`Performance:  ${results.performance.loadTime < 3000 ? '✅ PASS' : '⚠️  SLOW'}`);
  console.log(`JS Errors:    ${results.errors.length === 0 ? '✅ NONE' : `❌ ${results.errors.length} FOUND`}`);
  
  console.log('='.repeat(70));
  
  if (allPagesPassed && results.design.passed && results.errors.length === 0) {
    console.log('✅ ALL TESTS PASSED - Ready for production');
  } else {
    console.log('⚠️  Some issues found - review above');
  }

  return results;
}

runComprehensiveTests();

