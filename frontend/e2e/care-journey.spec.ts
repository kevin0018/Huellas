import { test, expect } from './fixtures';

for (const width of [375, 1440]) {
  test(`pet → health event → next care persists at ${width}px`, async ({ page, accounts }) => {
    const account = await accounts.create();
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    await page.getByLabel('Correo Electrónico', { exact: true }).fill(account.email);
    await page.getByLabel('Contraseña', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
    await expect(page).toHaveURL(/\/user-home$/);
    await page.goto('/pet-register');
    await page.getByLabel(/^Nombre/).fill('Miso E2E');
    await page.locator('#type').selectOption('cat');
    await page.locator('#birthDate').fill('2020-04-03');
    const created = page.waitForResponse(response => response.url().endsWith('/api/pets') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Crear mascota', exact: true }).click();
    const response = await created;
    expect(response.status()).toBe(201);
    const requestId = await response.request().headerValue('X-Request-ID');
    expect(requestId).toMatch(/^[\da-f-]{36}$/);
    expect(await response.headerValue('X-Request-ID')).toBe(requestId);
    const { id } = await response.json();
    await expect(page).toHaveURL(/\/user-home$/);

    await page.goto(`/procedures-view/${id}`);
    await expect(page.getByRole('heading', { name: 'E2E annual checkup', exact: true })).toBeVisible();
    await expect(page.getByText('Vencido', { exact: true })).toBeVisible();
    const before = await (await account.api.get('reminders')).json();
    const overdue = before.reminders.find((item: { petId: number; title: string }) => item.petId === id && item.title === 'E2E annual checkup');
    expect(overdue).toBeDefined();

    await page.goto(`/pets/${id}/health`);
    await page.getByRole('button', { name: 'Añadir evento', exact: true }).click();
    await page.getByLabel('Tipo', { exact: true }).selectOption('GENERAL_CHECKUP');
    await page.getByLabel('Título', { exact: true }).fill('E2E annual checkup');
    const occurredOn = await page.locator('#health-event-date').inputValue();
    await page.getByRole('button', { name: 'Guardar evento', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'E2E annual checkup', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'E2E annual checkup', exact: true })).toBeVisible();

    await page.goto(`/procedures-view/${id}`);
    await expect(page.getByRole('heading', { name: 'E2E annual checkup', exact: true })).toBeVisible();
    await expect(page.locator('article').getByText('Al día', { exact: true })).toBeVisible();
    const plan = await (await account.api.get(`pets/${id}/procedures`)).json();
    const rule = plan.find((item: { name: string }) => item.name === 'E2E annual checkup');
    expect(rule.status).toBe('DONE');
    expect(rule.lastOccurredAt.slice(0, 10)).toBe(occurredOn);
    expect(new Date(rule.dueAt).getTime() - new Date(rule.lastOccurredAt).getTime()).toBe(365 * 86400000);
    const after = await (await account.api.get('reminders')).json();
    expect(after.reminders.some((item: { id: number }) => item.id === overdue.id)).toBe(false);
    expect(after.reminders).toEqual(expect.arrayContaining([expect.objectContaining({ petId: id, title: 'E2E annual checkup', dueAt: rule.dueAt })]));
  });
}
