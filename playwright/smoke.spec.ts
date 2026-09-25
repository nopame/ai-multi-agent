import { test, expect } from '@playwright/test';

test('home renders nav and heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'ติดต่อผม' })).toBeVisible();
});

test('contact page has form fields', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByLabel('ชื่อ', { exact: true })).toBeVisible();
  await expect(page.getByLabel('อีเมล')).toBeVisible();
  await expect(page.getByLabel('ข้อความ')).toBeVisible();
});
