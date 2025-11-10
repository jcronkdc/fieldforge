import { chromium } from 'playwright';

async function testDeployment() {
  const baseUrl = process.argv[2] ?? 'https://fieldforge-fdcr44hqe-justins-projects-d7153a8c.vercel.app';
  
  console.log('🚀 Testing FieldForge Deployment');
  console.log('URL:', baseUrl);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const results = {
    landing: { passed: false, error: null },
    login: { passed: false, error: null },
    signup: { passed: false, error: null },
    design: { passed: false, issues: [] }
  };

  try {
    // Test 1: Landing Page
    console.log('📄 Testing Landing Page...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const landingContent = await page.content();
    const normalizedLanding = landingContent.toLowerCase();
    const hasBranding = normalizedLanding.includes('fieldforge');
    const hasHeroHeadline = normalizedLanding.includes('one control surface') || normalizedLanding.includes('transmission • distribution • substations');
    if (hasBranding && hasHeroHeadline) {
      results.landing.passed = true;
      console.log('   ✅ Landing page loads');
    } else {
      results.landing.error = 'Landing page content missing';
      console.log('   ❌ Landing page failed');
    }

    // Check for excessive animations
    const sparkles = await page.locator('.animate-float').count();
    if (sparkles > 0) {
      results.design.issues.push(`Found ${sparkles} floating sparkle animations (should be removed)`);
    }

    // Test 2: Login Page
    console.log('🔐 Testing Login Page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;
    
    if (hasEmailInput && hasPasswordInput && hasSubmitButton) {
      results.login.passed = true;
      console.log('   ✅ Login form renders correctly');
    } else {
      results.login.error = 'Login form incomplete';
      console.log('   ❌ Login form missing elements');
    }

    // Test 3: Signup Page
    console.log('📝 Testing Signup Page...');
    await page.goto(`${baseUrl}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const signupContent = await page.content();
    if (signupContent.includes('Create') || signupContent.includes('Sign Up') || signupContent.includes('Register')) {
      results.signup.passed = true;
      console.log('   ✅ Signup page loads');
    } else {
      results.signup.error = 'Signup page content missing';
      console.log('   ❌ Signup page failed');
    }

    // Test 4: Design Consistency Check
    console.log('🎨 Checking Design Consistency...');
    
    // Check for excessive gradients
    const gradients = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="gradient"]');
      return elements.length;
    });
    
    if (gradients > 50) {
      results.design.issues.push(`Excessive gradients: ${gradients} elements (consider reducing)`);
    }

    // Check for pulse animations
    const pulseAnimations = await page.evaluate(() => {
      const elements = document.querySelectorAll('.animate-pulse');
      return elements.length;
    });
    
    if (pulseAnimations > 10) {
      results.design.issues.push(`Too many pulse animations: ${pulseAnimations} (should be < 10)`);
    }

    results.design.passed = results.design.issues.length === 0;
    if (results.design.passed) {
      console.log('   ✅ Design is appropriately toned down');
    } else {
      console.log('   ⚠️  Design issues found:');
      results.design.issues.forEach(issue => console.log(`      - ${issue}`));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('');
  console.log('=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Landing Page:  ${results.landing.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login Page:    ${results.login.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Signup Page:   ${results.signup.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Design Check:  ${results.design.passed ? '✅ PASS' : '⚠️  ISSUES'}`);
  console.log('=' .repeat(60));

  const allPassed = results.landing.passed && results.login.passed && results.signup.passed;
  if (allPassed) {
    console.log('✅ All critical tests passed!');
  } else {
    console.log('❌ Some tests failed - review above');
  }

  return results;
}

testDeployment();

