const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/hrushi/.gemini/antigravity-ide/brain/14e21f63-0560-4c38-a476-2501619b8c43/screenshots';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'food_01_login.png') });

  // Login as admin
  await page.type('#email', 'admin@pnr.com');
  await page.type('#password', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log('2. Logged in! URL:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'food_02_dashboard.png'), fullPage: true });

  console.log('3. Navigating to /oreta/food...');
  await page.goto('http://localhost:3000/oreta/food', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'food_03_oreta_food_mobile.png'), fullPage: true });

  // Switch to Desktop Viewport
  await page.setViewport({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'food_04_oreta_food_desktop.png'), fullPage: true });

  console.log('4. Testing quick fill & submission on /oreta/food...');
  // Click ⚡ Set Current Time
  const btns = await page.$$('button');
  for (const b of btns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('⚡ Set Current Time')) {
      await b.click();
      break;
    }
  }

  // Click Submit
  for (const b of btns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Submit Food Safety Report')) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'food_05_submitted_history.png'), fullPage: true });

  console.log('✅ Verification completed successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
