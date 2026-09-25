import { test, expect } from '@playwright/test';

// Devices from phone (iPhone SE 1st gen) to desktop — D4: contact CTA visible without scrolling on Home
const viewports = [
  { name: 'phone-320', width: 320, height: 568 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];
const pages = ['/', '/about', '/interests', '/contact', '/guestbook'];

for (const vp of viewports) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of pages) {
      test(`${path} has no horizontal overflow and 36px+ tap targets`, async ({ page }) => {
        await page.goto(path);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const small = [...document.querySelectorAll('nav a, button, .btn, input, textarea')]
            .filter((e) => !e.closest('.hp'))
            .map((e) => e.getBoundingClientRect())
            .filter((b) => b.width > 0 && b.height < 36);
          return { overflow: doc.scrollWidth > doc.clientWidth, small: small.length };
        });
        expect(result.overflow).toBe(false);
        expect(result.small).toBe(0);
      });
    }

    test('home contact CTA is above the fold', async ({ page }) => {
      await page.goto('/');
      const box = await page.getByRole('link', { name: 'ติดต่อผม' }).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
    });
  });
}
