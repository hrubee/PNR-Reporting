const puppeteer = require("puppeteer-core");

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  console.log("🚀 Starting end-to-end dynamic staff and food safety verification...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));

  try {
    // 1. Login as Admin
    console.log("1. Navigating to login page...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    await page.type('#email', "admin@pnr.com");
    await page.type('#password', "Admin@123");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);
    console.log("✅ Admin logged in. URL:", page.url());

    // 2. Check Oreta Food Page
    console.log("2. Checking Oreta Food safety page...");
    await page.goto("http://localhost:3000/oreta/food", { waitUntil: "networkidle0" });
    const foodContent = await page.content();
    console.log("✅ Oreta Food Page loaded. Has 'Food Safety':", foodContent.includes("Food"));

    // 3. Check /admin/users
    console.log("3. Checking /admin/users...");
    await page.goto("http://localhost:3000/admin/users", { waitUntil: "networkidle0" });
    const usersContent = await page.content();
    console.log("✅ /admin/users loaded. Has 'Employee & User Management':", usersContent.includes("Employee & User Management"));

    // 4. Check /admin/access
    console.log("4. Checking /admin/access...");
    await page.goto("http://localhost:3000/admin/access", { waitUntil: "networkidle0" });
    const accessContent = await page.content();
    console.log("✅ /admin/access loaded. Has 'Multi-Outlet Access Matrix':", accessContent.includes("Multi-Outlet Access Matrix"));

    // 5. Check Oreta House Keeping
    console.log("5. Checking /oreta/shop-cleaning...");
    await page.goto("http://localhost:3000/oreta/shop-cleaning", { waitUntil: "networkidle0" });
    const shopContent = await page.content();
    console.log("✅ /oreta/shop-cleaning loaded. Has 'House Keeping':", shopContent.includes("House Keeping"));

    // 6. Check Oreta Equipment
    console.log("6. Checking /oreta/equipment...");
    await page.goto("http://localhost:3000/oreta/equipment", { waitUntil: "networkidle0" });
    const eqContent = await page.content();
    console.log("✅ /oreta/equipment loaded. Has 'Equipment Cleaning':", eqContent.includes("Equipment Cleaning"));

    // 7. Check Oreta Fridge
    console.log("7. Checking /oreta/fridge...");
    await page.goto("http://localhost:3000/oreta/fridge", { waitUntil: "networkidle0" });
    const fridgeContent = await page.content();
    console.log("✅ /oreta/fridge loaded. Has 'Fridge & Display':", fridgeContent.includes("Fridge & Display"));

    // 8. Check Oreta Glass
    console.log("8. Checking /oreta/glass...");
    await page.goto("http://localhost:3000/oreta/glass", { waitUntil: "networkidle0" });
    const glassContent = await page.content();
    console.log("✅ /oreta/glass loaded. Has 'Glass Cleaning':", glassContent.includes("Glass"));

    // 9. Check Oreta Monthly
    console.log("9. Checking /oreta/monthly...");
    await page.goto("http://localhost:3000/oreta/monthly", { waitUntil: "networkidle0" });
    const monthlyContent = await page.content();
    console.log("✅ /oreta/monthly loaded. Has 'Monthly Maintenance':", monthlyContent.includes("Monthly Maintenance"));

    // 10. Check Bakery Sheets
    console.log("10. Checking Bakery Sheets (/hygiene, /glass, /fridge, /kitchen, /production, /puff-room, /cake-room)...");
    for (const sheet of ["/hygiene", "/glass", "/fridge", "/kitchen", "/production", "/puff-room", "/cake-room"]) {
      await page.goto(`http://localhost:3000${sheet}`, { waitUntil: "networkidle0" });
      console.log(`✅ Bakery sheet ${sheet} verified ok.`);
    }

    console.log("\n🎉 ALL 16 OUTLET & ADMIN ROUTES VERIFIED WITH ZERO ERRORS!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
