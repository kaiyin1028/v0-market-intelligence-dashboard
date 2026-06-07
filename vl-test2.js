const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const reqs = [];
  page.on('requestfinished', async (req) => {
    const resp = req.response();
    const url = req.url();
    if (url.includes('/api/')) {
      const status = resp ? resp.status() : 'no-response';
      reqs.push({url: url.split('/api/v1')[1] || url, status});
    }
  });
  await page.goto('http://localhost:6060/volume-lab', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('After networkidle, reqs:', reqs.map(r => r.url));
  await page.waitForTimeout(8000);
  console.log('After 8s, reqs:', reqs.map(r => r.url));
  
  await page.screenshot({ path: '/tmp/vl-tab1-v2.png' });
  await page.click('button:has-text("成交量趨勢")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/vl-tab2-v2.png' });
  await page.click('button:has-text("籌碼分析")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/vl-tab3-v2.png' });
  await page.click('button:has-text("異常偵測")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/vl-tab4-v2.png' });
  await browser.close();
})();
