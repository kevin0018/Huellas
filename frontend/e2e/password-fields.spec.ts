import { test, expect } from '@playwright/test';

for (const width of [320, 1440]) {
  for (const path of ['/login', '/register']) {
    test(`password companion on ${path} at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const input = page.locator('input[name="password"]');
      const cat = page.locator('.password-companion .huellas-cat');
      const paw = cat.locator('.huellas-cat__paw--left');
      await expect(cat).toHaveAttribute('data-mood', 'idle');
      await expect(cat.locator('.huellas-cat__eye').first()).toHaveCSS('animation-name', 'cat-blink');
      await input.fill('Miso-test-123!');
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
      await expect(cat.locator('.huellas-cat__gaze')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 7)');
      await page.screenshot({ path: testInfo.outputPath('visible.png'), fullPage: true });
      for (const [language, code, action] of [['English', 'en', 'Hide password'], ['Català', 'ca', 'Amaga la contrasenya'], ['Español', 'es', 'Ocultar contraseña']]) {
        await page.getByRole('button', { name: /Cambiar idioma|Change language|Canvia l'idioma/ }).click();
        await page.getByRole('button', { name: language, exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('lang', code);
        await expect(page.getByRole('button', { name: action, exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(input).toHaveValue('Miso-test-123!');
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
      await expect(paw).toHaveCSS('transition-property', 'none');
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
      await input.fill('Miso-test-123!');
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
