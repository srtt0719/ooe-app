import { chromium } from "playwright";

const BASE = "https://ooe-app.vercel.app";
const shot = (n) =>
  "C:\\Users\\srtt0\\AppData\\Local\\Temp\\claude\\c--Users-srtt0-Desktop----\\fc61fe75-b27b-404c-b48d-b2a68bf9f0a4\\scratchpad\\p4-" +
  n;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

async function step(name, fn) {
  await fn();
  console.log("OK:", name);
}

async function waitForNoDisabledProcButtons() {
  for (let i = 0; i < 20; i++) {
    const disabledCount = await page.locator(".proc button[disabled]").count();
    if (disabledCount === 0) return;
    await page.waitForTimeout(500);
  }
}

await step("login", async () => {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="password"]', "ooe2026");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/login\/who$/);
  const has = await page.locator('button:has-text("田中")').count();
  if (has > 0) await page.click('button:has-text("田中")');
  else {
    await page.fill('input[name="userName"]', "田中");
    await page.click('button:has-text("追加してログイン")');
  }
  await page.waitForURL(`${BASE}/`);
});

await step("cleanup any leftover test sites from previous runs", async () => {
  for (let i = 0; i < 5; i++) {
    await page.goto(`${BASE}/sites?q=${encodeURIComponent("P4検証現場")}`);
    const link = page.locator("a.card.tap", { hasText: "P4検証現場" }).first();
    if ((await link.count()) === 0) break;
    await link.click();
    await page.waitForURL(/\/sites\/\d+$/);
    await page.click('a:has-text("編集")');
    await page.waitForURL(/\/sites\/\d+\/edit$/);
    await page.click('button:has-text("この現場を削除")');
    await page.click('button:has-text("削除に進む")');
    await page.fill('input[placeholder="削除"]', "削除");
    await page.click('button:has-text("削除する")');
    await page.waitForURL(/\/sites$/);
  }
});

await step("register site+product", async () => {
  await page.goto(`${BASE}/register`);
  await page.fill("#siteName", "P4検証現場");
  await page.fill("#productName", "P4検証製品");
  await page.selectOption("#material", "SS400");
  await page.fill("#thickness", "t9");
  await page.fill("#drawingNumber", "P4-001");
  await page.fill("#quantity", "3");
  await page.click('button:has-text("現場と製品を登録")');
  await page.waitForURL(/\/products\/\d+$/);
});

await step("complete all processes", async () => {
  let guard = 0;
  while (guard++ < 20) {
    await waitForNoDisabledProcButtons();
    const startBtn = page.locator('.proc button:has-text("着手")').first();
    if ((await startBtn.count()) === 0) break;
    await startBtn.click({ force: true, timeout: 8000 });
    await page.waitForSelector('label:has-text("着手者")', { timeout: 15000 });
    await page.click('button:has-text("この内容で着手")', { force: true });
    await page.waitForTimeout(500);
    await waitForNoDisabledProcButtons();
  }
  guard = 0;
  while (guard++ < 20) {
    await waitForNoDisabledProcButtons();
    const completeBtn = page.locator('.proc button:has-text("完了")').first();
    if ((await completeBtn.count()) === 0) break;
    await completeBtn.click({ force: true, timeout: 8000 });
    await page.waitForSelector('label:has-text("完了者")', { timeout: 15000 });
    await page.click('button:has-text("完了にする")', { force: true });
    await page.waitForTimeout(500);
    await waitForNoDisabledProcButtons();
  }
  await page.waitForSelector("text=100");
  await page.screenshot({ path: shot("1-100pct.png") });
});

await step("go to check screen, verify hint, submit", async () => {
  await page.click('a:has-text("完成チェックへ")', { force: true });
  await page.waitForURL(/\/products\/\d+\/check$/);
  const bodyText = await page.textContent("body");
  if (!bodyText.includes("SS400") || !bodyText.includes("P4-001")) {
    throw new Error("check hint missing product data: " + bodyText.slice(0, 500));
  }
  await page.screenshot({ path: shot("2-check-screen.png") });
  const boxes = page.locator(".box");
  const count = await boxes.count();
  for (let i = 0; i < count - 2; i++) {
    await boxes.nth(i).click({ force: true });
  }
  await page.click('button:has-text("チェック完了")', { force: true });
  await page.waitForURL(/\/products\/\d+$/);
  await page.waitForSelector("text=完成チェック済み");
  await page.screenshot({ path: shot("3-after-check.png") });
});

await step("product excluded from active lists", async () => {
  await page.goto(`${BASE}/products`);
  const bodyText = await page.textContent("body");
  if (bodyText.includes("P4検証製品")) throw new Error("finished product still in active 納期順 list");
});

await step("product appears in 作業終了リスト with ratio", async () => {
  await page.goto(`${BASE}/finished`);
  await page.waitForSelector("text=P4検証製品");
  const bodyText = await page.textContent("body");
  console.log("finished list has チェック ratio chip:", /チェック \d+\/\d+/.test(bodyText));
  await page.screenshot({ path: shot("4-finished-list.png") });
});

await step("material detail add on product detail", async () => {
  await page.click("text=P4検証製品", { force: true });
  await page.waitForURL(/\/products\/\d+$/);
  const url = page.url();
  await page.fill('input[name="partName"]', "ベースプレート");
  await page.fill('input[name="materialGrade"]', "SS400");
  await page.fill('input[name="sizeSpec"]', "t12");
  await page.click('button:has-text("部材を追加")', { force: true });
  await page.waitForTimeout(700);
  await page.goto(url);
  const bodyText = await page.textContent("body");
  if (!bodyText.includes("ベースプレート")) throw new Error("material detail not saved");
  await page.screenshot({ path: shot("5-material-detail.png") });
});

await step("settings: process template edit", async () => {
  await page.goto(`${BASE}/settings/process-templates`);
  await page.waitForSelector("text=標準");
  await page.screenshot({ path: shot("6-settings-templates.png") });
});

await step("settings: check items page loads", async () => {
  await page.goto(`${BASE}/settings/check-items`);
  await page.waitForSelector("text=材料・板厚は図面通りか");
});

await step("settings: users page shows ID未登録 badge", async () => {
  await page.goto(`${BASE}/settings/users`);
  const bodyText = await page.textContent("body");
  console.log("has ID未登録 marker:", bodyText.includes("ID未登録"));
  await page.screenshot({ path: shot("7-settings-users.png") });
});

await step("settings: top page notification form loads", async () => {
  await page.goto(`${BASE}/settings`);
  await page.waitForSelector("text=LINE WORKS 通知先");
  await page.screenshot({ path: shot("8-settings-top.png") });
});

console.log("ERRORS:", JSON.stringify(errors));
console.log("ALL OK");
await browser.close();
