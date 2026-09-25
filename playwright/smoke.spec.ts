import { test, expect } from '@playwright/test';

test('home renders nav and heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('nav has 4 pages and no guestbook', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link')).toHaveCount(4);
  await expect(nav.getByRole('link', { name: /guestbook/i })).toHaveCount(0);
});

test('contact CTA is in the first screen at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'ติดต่อผม' })).toBeInViewport();
});

test('contact page shows a channel; form only when enabled', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('/api/contact');
  const form = page.locator('#contact-form');
  if (await form.count()) {
    await expect(page.getByLabel('ชื่อ')).toBeVisible();
    await expect(page.getByLabel('อีเมล')).toBeVisible();
    await expect(page.getByLabel('ข้อความ')).toBeVisible();
  }
});
