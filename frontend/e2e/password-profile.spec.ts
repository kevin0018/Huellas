import { test, expect } from './fixtures';

for (const width of [375, 1440]) {
  test(`independent password controls still change the real account password at ${width}px`, async ({ page, accounts }, testInfo) => {
    const account = await accounts.create();
    const nextPassword = 'Miso-new-password-456!';
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    await page.getByLabel('Correo Electrónico', { exact: true }).fill(account.email);
    await page.getByLabel('Contraseña', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
    await expect(page).toHaveURL(/\/user-home$/);
    await page.goto('/user-profile');
    const current = page.locator('#currentPassword');
    const next = page.locator('#newPassword');
    const confirm = page.locator('#confirmPassword');
    await current.fill(account.password);
    await next.fill(nextPassword);
    await confirm.fill(nextPassword);
    await expect(page.locator('.password-companion')).toHaveCount(1);
    await page.getByRole('button', { name: 'Mostrar contraseña: Contraseña actual', exact: true }).click();
    await expect(current).toHaveAttribute('type', 'text');
    await expect(next).toHaveAttribute('type', 'password');
    await expect(confirm).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Cambiar idioma' }).click();
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.getByRole('button', { name: 'Show password: New password', exact: true }).click();
    await expect(next).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('button', { name: 'Català', exact: true }).click();
    await page.getByRole('button', { name: 'Mostra la contrasenya: Confirma la contrasenya', exact: true }).click();
    await expect(confirm).toHaveAttribute('type', 'text');
    await expect(current).toHaveValue(account.password);
    await expect(next).toHaveValue(nextPassword);
    await page.screenshot({ path: testInfo.outputPath('profile-passwords.png'), fullPage: true });
    await page.getByRole('button', { name: 'Canvia la contrasenya', exact: true }).click();
    await expect(page.getByText('Canvis desats', { exact: true })).toBeVisible();
    await expect(next).toHaveValue('');
    const login = await account.api.post('auth/login', { data: { email: account.email, password: nextPassword } });
    expect(login.status()).toBe(200);
    const oldLogin = await account.api.post('auth/login', { data: { email: account.email, password: account.password } });
    expect(oldLogin.status()).toBe(401);
  });
}
