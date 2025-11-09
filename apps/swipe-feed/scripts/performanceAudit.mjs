import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const targetUrl = process.argv[2];

  if (!targetUrl) {
    console.error('Usage: node scripts/performanceAudit.mjs <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const metrics = {
    url: targetUrl,
    timestamp: new Date().toISOString(),
  };

  try {
    const navigationStart = Date.now();
    await page.goto(targetUrl, { waitUntil: 'load', timeout: 60000 });
    const navigationEnd = Date.now();

    const navEntry = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation');
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {
        duration: entry?.duration ?? null,
        domInteractive: entry?.domInteractive ?? null,
        domContentLoaded: entry?.domContentLoadedEventEnd ?? null,
        loadEventEnd: entry?.loadEventEnd ?? null,
        transferSize: entry?.transferSize ?? null,
        encodedBodySize: entry?.encodedBodySize ?? null,
        decodedBodySize: entry?.decodedBodySize ?? null,
        firstContentfulPaint: fcp?.startTime ?? null,
        timeToFirstByte: entry ? entry.responseStart - entry.requestStart : null,
      };
    });

    metrics.navigationTimeMs = navigationEnd - navigationStart;
    metrics.navigation = navEntry;

    const memoryStats = await page.evaluate(() => {
      if ('memory' in performance) {
        const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = performance.memory;
        return { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize };
      }
      return null;
    });

    metrics.memory = memoryStats;
  } catch (error) {
    metrics.error = error instanceof Error ? error.message : String(error);
    console.error('Performance audit failed:', error);
  } finally {
    await browser.close();
  }

  const outputDir = path.resolve(process.cwd(), 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(
    outputDir,
    `performance-report-${Date.now()}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
  console.log(`Performance report written to ${outputPath}`);
}

run();

