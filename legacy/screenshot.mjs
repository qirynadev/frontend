import { chromium } from "playwright";

const URL = process.env.SHOT_URL || "http://localhost:5173/";
const WIDTH = Number(process.env.SHOT_W || 1280);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 } });
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);

// Dismiss cookie / consent modal if present
for (const label of ["Tout accepter", "Accepter", "Refuser", "J'accepte", "Tout refuser", "OK"]) {
  const btn = page.getByRole("button", { name: label });
  if (await btn.count()) {
    try { await btn.first().click({ timeout: 1000 }); break; } catch {}
  }
}
await page.waitForTimeout(500);

// Total page height
const total = await page.evaluate(() => document.body.scrollHeight);
const step = 900;
let i = 0;
for (let y = 0; y < total; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `shots/chunk-${WIDTH}-${String(i).padStart(2, "0")}.png` });
  console.log(`saved shots/chunk-${WIDTH}-${String(i).padStart(2, "0")}.png (y=${y})`);
  i++;
}

await browser.close();
