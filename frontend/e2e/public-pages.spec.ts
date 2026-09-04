import { test, expect } from '@playwright/test';

for (const width of [320, 375, 414, 768, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`public pages at ${width}px in ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(value => localStorage.setItem('theme', value), theme);
      const pageErrors: string[] = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      for (const path of ['/', '/about']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        for (const [language, code] of [['English', 'en'], ['Català', 'ca'], ['Español', 'es']]) {
          await page.getByRole('button', { name: /Cambiar idioma|Change language|Canvia l'idioma/ }).click();
          await page.getByRole('button', { name: language, exact: true }).click();
          await expect(page.locator('html')).toHaveAttribute('lang', code);
          if (path === '/about') {
            const aboutCopy = {
              en: ['More time together. Better care.', 'A better life, by your side.'],
              ca: ['Més temps junts. Més cura.', 'Una vida millor, al teu costat.'],
              es: ['Más tiempo juntos. Más cuidado.', 'Una vida mejor, a tu lado.'],
            }[code];
            if (!aboutCopy) throw new Error(`Missing About expectations for ${code}`);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(aboutCopy[0]);
            await expect(page.getByText(aboutCopy[1], { exact: true })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Kevin Hernandez' })).toBeVisible();
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          // Check actual bounds as overflow:clip can hide a broken layout.
          const overflow = await page.locator('main').evaluate(element =>
            [...element.querySelectorAll('h1,h2,h3,p,a,img')].filter(node => {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
            }).map(node => node.textContent || node.tagName));
          expect(overflow).toEqual([]);
        }
        if (path === '/about') {
          const contrasts = await page.getByRole('region', { name: 'Nuestra Visión' }).evaluate(section => {
            const context = document.createElement('canvas').getContext('2d');
            if (!context) throw new Error('Canvas required to resolve rendered CSS colors');
            const luminance = (color: string) => {
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
              const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
                const channel = value / 255;
                return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
              });
              return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
            };
            const background = luminance(getComputedStyle(section).backgroundColor);
            return [...section.querySelectorAll('h2,p')].map(element => {
              const foreground = luminance(getComputedStyle(element).color);
              return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
            });
          });
          for (const contrast of contrasts) expect(contrast).toBeGreaterThanOrEqual(4.5);
        }
        await page.screenshot({ path: testInfo.outputPath(`${path === '/' ? 'home' : 'about'}.png`), fullPage: true });
      }
      expect(pageErrors).toEqual([]);
    });
  }
}

test('home links lead to registration and the team without a full-page navigation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.dataset.navigationProbe = 'same-document'; });
  await page.getByRole('link', { name: 'Empieza ahora', exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('html')).toHaveAttribute('data-navigation-probe', 'same-document');
  await page.goto('/');
  await page.getByRole('link', { name: 'Conoce al Equipo', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByText('Kevin Hernandez', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Más tiempo juntos. Más cuidado.');
});
