import { chromium } from 'playwright';

async function run() {
  const baseUrl = process.argv[2] ?? 'https://fieldforge-a01rcvf1m-justins-projects-d7153a8c.vercel.app';
  const email = process.argv[3] ?? 'demo@fieldforge.com';
  const password = process.argv[4] ?? 'FieldForge2025!Demo';

  const browser = await chromium.launch({ headless: true });
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
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("ACCESS SYSTEM")');
    await page.waitForTimeout(5000);

    const content = await page.content();
    if (content.includes('Something went wrong')) {
      console.log('[result] Error page detected');
    } else if (content.includes('COMMAND CENTER')) {
      console.log('[result] Dashboard loaded');
    } else {
      console.log('[result] Unknown state');
    }
  } catch (error) {
    console.error('[script-error]', error);
  } finally {
    await browser.close();
  }
}

run();

