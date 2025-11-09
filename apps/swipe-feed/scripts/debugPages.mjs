import { chromium } from 'playwright';

async function debugPages() {
  const baseUrl = process.argv[2] ?? 'https://fieldforge-fdcr44hqe-justins-projects-d7153a8c.vercel.app';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  try {
    // Test Landing Page
    console.log('🔍 Debugging Landing Page...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const h1 = await page.locator('h1').first().textContent();
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log('  H1 Text:', h1);
    console.log('  Buttons:', buttons);
    console.log('  Links:', links);
    console.log('  Errors:', errors.length);
    if (errors.length > 0) {
      console.log('  Error details:', errors);
    }

    // Test Login Page
    console.log('\n🔍 Debugging Login Page...');
    errors.length = 0;
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    const allButtons = await page.locator('button').count();
    
    console.log('  Email inputs:', emailInput);
    console.log('  Password inputs:', passwordInput);
    console.log('  Submit buttons:', submitButton);
    console.log('  All buttons:', allButtons);
    console.log('  Errors:', errors.length);
    if (errors.length > 0) {
      console.log('  Error details:', errors);
    }

    // Get page title and visible text
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();
    console.log('  Page title:', title);
    console.log('  Contains "FIELDFORGE":', bodyText.includes('FIELDFORGE'));
    console.log('  Contains "ACCESS SYSTEM":', bodyText.includes('ACCESS SYSTEM'));

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugPages();

