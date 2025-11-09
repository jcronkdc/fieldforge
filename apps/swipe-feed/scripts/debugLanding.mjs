import { chromium } from 'playwright';

async function debugLanding() {
  const baseUrl = process.argv[2] ?? 'http://localhost:5173';
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging Landing Page');
    console.log('URL:', baseUrl);
    console.log('');

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Get all text content
    const h1Text = await page.locator('h1').allTextContents();
    const h2Text = await page.locator('h2').allTextContents();
    const buttonText = await page.locator('button').allTextContents();
    
    console.log('H1 Elements:', h1Text);
    console.log('H2 Elements:', h2Text);
    console.log('Buttons:', buttonText);
    console.log('');
    
    // Check for specific content
    const bodyText = await page.locator('body').textContent();
    console.log('Contains "FIELDFORGE":', bodyText.includes('FIELDFORGE'));
    console.log('Contains "Build":', bodyText.includes('Build'));
    console.log('Contains "Power Grid":', bodyText.includes('Power Grid'));
    console.log('Contains "Get Started":', bodyText.includes('Get Started'));
    console.log('');
    
    // Check for navigation
    const navExists = await page.locator('nav').count();
    console.log('Navigation elements:', navExists);
    
    // Check for main content
    const mainExists = await page.locator('main').count();
    console.log('Main elements:', mainExists);
    
    // Get page structure
    const structure = await page.evaluate(() => {
      const body = document.body;
      return {
        childCount: body.children.length,
        firstChildTag: body.children[0]?.tagName,
        hasCanvas: document.querySelector('canvas') !== null,
        hasNav: document.querySelector('nav') !== null,
        hasMain: document.querySelector('main') !== null
      };
    });
    
    console.log('');
    console.log('Page Structure:', structure);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugLanding();

