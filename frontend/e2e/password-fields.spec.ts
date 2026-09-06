import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

for (const width of [320, 1440]) {
  for (const path of ['/login', '/register']) {
    test(`password companion on ${path} at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const password = randomUUID();
      const input = page.locator('input[name="password"]');
      const cat = page.locator('.password-companion .huellas-cat');
      const paw = cat.locator('.huellas-cat__paw--left');
      await expect(cat).toHaveAttribute('data-mood', 'idle');
      await expect(cat.locator('.huellas-cat__eye').first()).toHaveCSS('animation-name', 'cat-blink');
      await input.fill(password);
      await expect(cat).toHaveAttribute('data-mood', 'hiding');
      // Verify that the paw actually moves over the eye, beyond the data attribute.
      await expect.poll(async () => {
        const hand = await paw.boundingBox();
        const eye = await cat.locator('.huellas-cat__eye').first().boundingBox();
        return !!hand && !!eye && hand.y < eye.y && hand.y + hand.height > eye.y + eye.height;
      }).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('hidden.png'), fullPage: true });
      const selection = await input.evaluate((element: HTMLInputElement) => {
        element.setSelectionRange(2, 5);
        return [element.selectionStart, element.selectionEnd];
      });
      await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
      await expect(input).toHaveAttribute('type', 'text');
      await expect(input).toBeFocused();
      expect(await input.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd])).toEqual(selection);
      await expect(cat).toHaveAttribute('data-mood', 'watching');
      await expect.poll(() => cat.locator('.huellas-cat__gaze').evaluate(element => {
        const gaze = new DOMMatrix(getComputedStyle(element).transform);
        return gaze.m42 > 0 && (innerWidth >= 1280 ? gaze.m41 < 0 : Math.abs(gaze.m41) < 1);
      })).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('visible.png'), fullPage: true });
      for (const [language, code, action] of [['English', 'en', 'Hide password'], ['Català', 'ca', 'Amaga la contrasenya'], ['Español', 'es', 'Ocultar contraseña']]) {
        await page.getByRole('button', { name: /Cambiar idioma|Change language|Canvia l'idioma/ }).click();
        await page.getByRole('button', { name: language, exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('lang', code);
        await expect(page.getByRole('button', { name: action, exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(input).toHaveValue(password);
      }
      await input.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(input).toHaveAttribute('type', 'password');
      await page.keyboard.press('Tab');
      await expect(cat).toHaveAttribute('data-mood', 'idle');
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
      await page.evaluate(() => localStorage.setItem('theme', 'dark'));
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(cat.locator('.huellas-cat__eye').first()).toHaveCSS('animation-name', 'none');
      await expect(cat.locator('.huellas-cat__arm').first()).toHaveCSS('transition-property', 'none');
      // Check the actual icon contrast, including any theme transition in progress.
      await expect.poll(() => page.locator('.password-input__toggle').evaluate(element => {
        const context = document.createElement('canvas').getContext('2d')!;
        function luminance(color: string) {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        }
        const ink = luminance(getComputedStyle(element).color);
        const paper = luminance(getComputedStyle(element.previousElementSibling!).backgroundColor);
        return (Math.max(ink, paper) + 0.05) / (Math.min(ink, paper) + 0.05);
      })).toBeGreaterThanOrEqual(3);
      await input.fill(password);
      await expect(cat).toHaveAttribute('data-mood', 'hiding');
      await page.screenshot({ path: testInfo.outputPath('dark-reduced-motion.png'), fullPage: true });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const field = await input.boundingBox();
      const toggle = await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).boundingBox();
      expect(field && toggle && toggle.x >= field.x && toggle.x + toggle.width <= field.x + field.width).toBe(true);
    });
  }
}

test('the care notebook supports keyboard navigation and keeps the chosen page across languages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Tu mascota' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Su cartilla' })).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: 'Su cartilla' })).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('heading', { name: 'Mira qué viene después' })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar idioma' }).click();
  await page.getByRole('button', { name: 'Català', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'El que ve' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Mira què ve després' })).toBeVisible();
});


test('the large desktop cat follows the cursor, prioritizes passwords and respects reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/login');
  const cat = page.locator('.password-companion .huellas-cat');
  const form = page.locator('.form-surface');
  const password = randomUUID();
  const input = page.locator('#login-password');
  const bounds = (await cat.boundingBox())!;
  const formBounds = (await form.boundingBox())!;
  expect(bounds.width).toBeGreaterThan(400);
  expect(bounds.x).toBeGreaterThan(formBounds.x + formBounds.width);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(1920);
  const gaze = cat.locator('.huellas-cat__gaze');
  const head = cat.locator('.huellas-cat__head');
  await page.mouse.move(20, 120);
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeLessThan(-3);
  await expect.poll(() => head.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m12)).toBeLessThan(0);
  await page.screenshot({ path: testInfo.outputPath('following-left.png'), fullPage: true });
  await page.mouse.move(1900, 950);
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeGreaterThan(3);
  await expect.poll(() => head.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m12)).toBeGreaterThan(0);
  await input.fill(password);
  await page.mouse.move(20, 120);
  await expect(cat).toHaveAttribute('data-mood', 'hiding');
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBe(0);
  for (const side of ['left', 'right']) {
    const eye = cat.locator('.huellas-cat__eye').nth(side === 'left' ? 0 : 1);
    const paw = cat.locator(`.huellas-cat__paw--${side}`);
    await expect.poll(async () => {
      const e = (await eye.boundingBox())!;
      const p = (await paw.boundingBox())!;
      return p.x <= e.x && p.y <= e.y && p.x + p.width >= e.x + e.width && p.y + p.height >= e.y + e.height;
    }).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath('covered.png'), fullPage: true });
  await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
  await page.mouse.move(1900, 950);
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeLessThan(-3);
  await page.screenshot({ path: testInfo.outputPath('watching-password.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ocultar contraseña', exact: true }).click();
  await page.locator('#login-email').focus();
  await expect(cat).toHaveAttribute('data-mood', 'idle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(1900, 950);
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBe(0);
  await expect(head).toHaveCSS('transition-property', 'none');
  // Changing the preference while mounted should re-enable tracking.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(20, 120);
  await expect.poll(() => gaze.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeLessThan(-3);
  await page.setViewportSize({ width: 320, height: 900 });
  await expect.poll(async () => (await cat.boundingBox())!.width).toBeLessThan(260);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
