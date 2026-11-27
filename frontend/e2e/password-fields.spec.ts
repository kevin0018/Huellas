import { test, expect } from '@playwright/test';

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

for (const width of [320, 1440]) {
  for (const path of ['/login', '/register']) {
    test(`${path} integrates the pet scene with the form at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const scene = page.locator('canvas.login-pets');
      const pixels = () => scene.evaluate((el: HTMLCanvasElement) => el.toDataURL());
      const email = page.getByLabel('Correo Electrónico', { exact: true });
      const password = page.locator('input[name="password"]');
      const toggle = page.locator('.password-input__toggle');
      await expect(scene).toHaveAttribute('aria-hidden', 'true');
      await expect(scene).toHaveAttribute('data-pose', 'idle');
      const first = await pixels();
      await expect.poll(pixels).not.toBe(first);
      await email.fill('test@example.com');
      await expect(scene).toHaveAttribute('data-pose', 'attentive');
      await page.keyboard.press('Tab');
      await password.fill('sample-only');
      await expect(scene).toHaveAttribute('data-pose', 'hiding');
      await password.evaluate((el: HTMLInputElement) => el.setSelectionRange(1, 4));
      for (const pose of ['watching', 'hiding', 'watching']) {
        await toggle.click();
        await expect(scene).toHaveAttribute('data-pose', pose);
      }
      await expect(password).toBeFocused();
      await expect(password).toHaveAttribute('type', 'text');
      expect(await password.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([1, 4]);
      for (const [language, code, action] of [['English', 'en', 'Hide password'], ['Català', 'ca', 'Amaga la contrasenya'], ['Español', 'es', 'Ocultar contraseña']]) {
        await page.getByRole('button', { name: /Cambiar idioma|Change language|Canvia l'idioma/ }).click();
        await page.getByRole('button', { name: language, exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('lang', code);
        await expect(toggle).toHaveAccessibleName(action);
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(password).toHaveValue('sample-only');
      }
      await password.focus();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const peek = await pixels();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(password).toHaveAttribute('type', 'password');
      await expect.poll(pixels).not.toBe(peek);
      const hidden = await pixels();
      await page.waitForTimeout(180);
      expect(await pixels()).toBe(hidden);
      await page.keyboard.press('Tab');
      await expect(scene).toHaveAttribute('data-pose', 'idle');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => localStorage.setItem('theme', 'dark'));
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/dark/);
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
      const form = page.locator('.auth-pet-panel form');
      const panelBounds = (await page.locator('.auth-pet-panel').boundingBox())!;
      const formBounds = (await form.boundingBox())!;
      const bounds = (await scene.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(panelBounds.x);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(panelBounds.x + panelBounds.width);
      if (width >= 896) expect(bounds.x).toBeGreaterThan(formBounds.x + formBounds.width);
      else expect(bounds.y + bounds.height).toBeLessThan(formBounds.y);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    });
  }
}
