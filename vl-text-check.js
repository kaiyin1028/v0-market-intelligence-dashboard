const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:6060/volume-lab', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);
  await page.click('button:has-text("成交量趨勢")');
  await page.waitForTimeout(1000);
  
  const texts = await page.evaluate(() => {
    const cards = document.querySelectorAll('.glass-card');
    return Array.from(cards).slice(0, 6).map(c => {
      const label = c.querySelector('p.text-muted-foreground')?.textContent?.trim();
      const value = c.querySelector('p.text-2xl')?.textContent?.trim();
      return { label, value };
    });
  });
  
  console.log(JSON.stringify(texts, null, 2));
  await browser.close();
})();
