const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/hrushi/.gemini/antigravity-ide/brain/14e21f63-0560-4c38-a476-2501619b8c43/screenshots';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set Mobile Viewport (iPhone 14 Pro style: 393 x 852)
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_mobile_login.png') });

  // Login
  await page.type('#email', 'admin@pnr.com');
  await page.type('#password', 'Admin@123');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Logged in! Current URL:', page.url());

  // 1. Mobile Dashboard
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_mobile_dashboard.png'), fullPage: true });

  // 2. Mobile Hygiene Report
  await page.goto('http://localhost:3000/hygiene', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_mobile_hygiene.png'), fullPage: true });

  // 3. Mobile Fridge Report
  await page.goto('http://localhost:3000/fridge', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_mobile_fridge.png'), fullPage: true });

  // 4. Mobile Kitchen Report
  await page.goto('http://localhost:3000/kitchen', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_mobile_kitchen.png'), fullPage: true });

  // 5. Mobile Cake Room Report
  await page.goto('http://localhost:3000/cake-room', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_mobile_cake_room.png'), fullPage: true });

  // 6. Mobile Admin Reports
  await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_mobile_admin_reports.png'), fullPage: true });

  // 7. Desktop Dashboard & Reports
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_desktop_dashboard.png') });

  await page.goto('http://localhost:3000/fridge', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_desktop_fridge.png'), fullPage: true });

  await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_desktop_admin_reports.png'), fullPage: true });

  await browser.close();
  console.log('✅ All screenshots saved successfully in', ARTIFACT_DIR);
}

run().catch(console.error);
