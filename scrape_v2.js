const { chromium } = require('playwright');

const URLS = {
  STC: [
    { url: 'https://www.stc.com.sa/content/stc-public-store/sa/ar/public-store-landing-page/baity-packages.html', name: 'STC Baity' }
  ],
  Mobily: [
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-200', name: '200' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-300', name: '300' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-400', name: '400' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-500', name: '500' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-1gb', name: '1G' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/fiber-postpaid-gamers', name: 'Gamers' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/mobily-home-fttr400', name: 'FTTR400' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/mobily-home-fttr500', name: 'FTTR500' },
    { url: 'https://www.mobily.com.sa/web/en/personal/home/fiber-postpaid/mobily-home-fttr1gbps', name: 'FTTR1G' },
  ],
  Zain: [
    { url: 'https://sa.zain.com/en/home/fiber-home/fiber-home-basic-plus', name: 'Fiber' }
  ],
  Salam: [
    { url: 'https://salam.sa/ar/consumer/home/salam-fiber/fiber-postpaid/', name: 'Fiber' }
  ],
  Go: [
    { url: 'https://www.go.com.sa/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84%D9%81%D8%A7%D9%8A%D8%A8%D8%B1-%D8%A7%D9%84%D9%85%D9%81%D9%88%D8%AA%D8%B1%D8%A9/FTTH_POST_100_D_N', name: '100' },
    { url: 'https://www.go.com.sa/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84%D9%81%D8%A7%D9%8A%D8%A8%D8%B1-%D8%A7%D9%84%D9%85%D9%81%D9%88%D8%AA%D8%B1%D8%A9/FTTH_POST_200_D_N', name: '200' },
    { url: 'https://www.go.com.sa/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84%D9%81%D8%A7%D9%8A%D8%A8%D8%B1-%D8%A7%D9%84%D9%85%D9%81%D9%88%D8%AA%D8%B1%D8%A9/FTTH_POST300_12M', name: '300' },
    { url: 'https://www.go.com.sa/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84%D9%81%D8%A7%D9%8A%D8%A8%D8%B1-%D8%A7%D9%84%D9%85%D9%81%D9%88%D8%AA%D8%B1%D8%A9/FTTH_POST_500_API_D', name: '500' },
  ]
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const result = {};
  for (const [provider, pages] of Object.entries(URLS)) {
    result[provider] = [];
    for (const pageInfo of pages) {
      console.error(`Scraping ${provider} ${pageInfo.name}...`);
      let text = '';
      try {
        const page = await (await browser.newContext({
          locale: 'ar-SA',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 900 }
        })).newPage();
        await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,ttf,eot,mp4,webm}', r => r.abort());
        await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(provider === 'STC' ? 25000 : 18000);
        if (provider === 'Mobily' || provider === 'Go') {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(5000);
        }
        text = await page.evaluate(() => document.body.innerText);
        await page.close();
        console.error(`  OK (${text.length} chars)`);
      } catch (e) {
        console.error(`  FAIL: ${e.message}`);
      }
      result[provider].push({ name: pageInfo.name, url: pageInfo.url, text });
    }
  }
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})();
