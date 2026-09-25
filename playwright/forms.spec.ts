import { test, expect } from '@playwright/test';

// Needs the real backend (writes to the dev DB under DATA_DIR) — run against a dev/test server, never production.
test('contact form sends and confirms without promising a reply (D6)', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('ชื่อ', { exact: true }).fill('Demo');
  await page.getByLabel('อีเมล').fill('demo@example.com');
  await page.getByLabel('ข้อความ', { exact: true }).fill('ทดสอบจาก Playwright');
  await expect(page.locator('#message-count')).toHaveText(/^\d+\/1000$/);
  await page.getByRole('button', { name: 'ส่งข้อความ' }).click();
  await expect(page.locator('#status')).toHaveText('ได้รับข้อความแล้วครับ');
});

test('guestbook renders HTML as plain text (D14)', async ({ page }) => {
  await page.goto('/guestbook');
  const payload = `<img src=x onerror="window.__pwned=1"> ${Date.now()}`;
  await page.getByLabel('ชื่อที่แสดง').fill('Playwright');
  await page.getByLabel('ข้อความ', { exact: true }).fill(payload);
  await page.getByRole('button', { name: 'ลงชื่อ' }).click();
  await expect(page.locator('#entries .entry p').first()).toHaveText(payload);
  expect(await page.locator('#entries img').count()).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
});
