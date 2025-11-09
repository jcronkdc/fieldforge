import { chromium } from 'playwright';

async function run() {
  const baseUrl = process.argv[2] ?? 'https://fieldforge-fdcr44hqe-justins-projects-d7153a8c.vercel.app';
  const email = process.argv[3] ?? 'demo@fieldforge.com';
  const password = process.argv[4] ?? 'FieldForge2025!Demo';

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log('[browser]', msg.type(), msg.text());
  });

  page.on('pageerror', (error) => {
    console.log('[browser-error]', error);
  });

  try {
    console.log('[test] Navigating to login page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log('[test] Waiting for login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('[test] Filling email...');
    await page.fill('input[type="email"]', email);
    
    console.log('[test] Filling password...');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', password);
    
    console.log('[test] Clicking login button...');
    await page.click('button[type="submit"]');
    
    console.log('[test] Waiting for navigation...');
    await page.waitForTimeout(5000);

    const url = page.url();
    const content = await page.content();
    
    console.log('[result] Current URL:', url);
    
    if (content.includes('Something went wrong')) {
      console.log('[result] ❌ Error page detected');
    } else if (content.includes('Dashboard') || content.includes('COMMAND CENTER') || url.includes('/dashboard')) {
      console.log('[result] ✅ Dashboard loaded successfully');
    } else if (content.includes('Invalid')) {
      console.log('[result] ⚠️  Invalid credentials');
    } else {
      console.log('[result] ⚠️  Unknown state');
    }
  } catch (error) {
    console.error('[script-error]', error.message);
  } finally {
    await browser.close();
  }
}

run();

