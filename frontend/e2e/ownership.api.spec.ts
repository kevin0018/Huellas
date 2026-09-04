import { test, expect, createPet, apiURL } from './fixtures';

const eventInput = { type: 'GENERAL_CHECKUP', title: 'E2E annual checkup', occurredAt: '2026-01-10T12:00:00.000Z' };

test('HTTP ownership protects pets, events, documents, appointments and reminders in MySQL', async ({ accounts, playwright }) => {
  const owner = await accounts.create();
  const stranger = await accounts.create();
  const pet = await createPet(owner.api, { ownerId: stranger.id, allergies: 'Private allergy' });
  const mine = await (await owner.api.get('owners/my-pets')).json();
  expect(mine).toEqual(expect.arrayContaining([expect.objectContaining({ id: pet.id })]));
  expect(await (await stranger.api.get('owners/my-pets')).json()).toEqual([]);
  const anonymous = await playwright.request.newContext({ baseURL: apiURL });
  try { expect((await anonymous.get(`pets/${pet.id}`)).status()).toBe(401); }
  finally { await anonymous.dispose(); }

  for (const path of [`pets/${pet.id}`, `pets/${pet.id}/health-events`, `pets/${pet.id}/health-shares`, `pets/${pet.id}/procedures`]) {
    expect((await stranger.api.get(path)).status()).toBe(403);
  }
  expect((await stranger.api.patch(`pets/${pet.id}`, { data: { name: 'Intruder' } })).status()).toBe(403);
  expect((await stranger.api.delete(`pets/${pet.id}`)).status()).toBe(403);
  expect((await stranger.api.post(`pets/${pet.id}/health-events`, { data: eventInput })).status()).toBe(403);
  const created = await owner.api.post(`pets/${pet.id}/health-events`, { data: eventInput });
  expect(created.status()).toBe(201);
  const event = await created.json();
  expect((await stranger.api.put(`health-events/${event.id}`, { data: { ...eventInput, title: 'Intruder' } })).status()).toBe(404);
  expect((await stranger.api.delete(`health-events/${event.id}`)).status()).toBe(404);
  expect(await (await owner.api.get(`pets/${pet.id}/health-events`)).json()).toEqual(expect.arrayContaining([expect.objectContaining({ id: event.id, title: eventInput.title })]));

  const document = await owner.api.post(`pets/${pet.id}/health-documents`, { data: { fileName: 'report.pdf', mimeType: 'application/pdf', contentBase64: Buffer.from('%PDF-1.4\nE2E report').toString('base64'), healthEventId: event.id } });
  expect(document.status()).toBe(201);
  const { id: documentId } = await document.json();
  expect((await stranger.api.get(`health-documents/${documentId}`)).status()).toBe(404);
  expect((await stranger.api.delete(`health-documents/${documentId}`)).status()).toBe(404);
  expect((await owner.api.get(`health-documents/${documentId}`)).ok()).toBe(true);

  const appointmentInput = { petId: pet.id, date: '2028-06-15T10:00:00.000Z', reason: 'GENERAL_CHECKUP', status: 'scheduled' };
  const deniedAppointment = await stranger.api.post('appointments', { data: appointmentInput });
  expect(deniedAppointment.status()).toBe(400);
  expect(await deniedAppointment.json()).toEqual({ error: 'Pet not found or does not belong to this owner' });
  const appointmentResponse = await owner.api.post('appointments', { data: appointmentInput });
  expect(appointmentResponse.status()).toBe(201);
  const appointment = await appointmentResponse.json();
  for (const method of ['get', 'delete'] as const) expect((await stranger.api[method](`appointments/${appointment.id}`)).status()).toBe(404);
  expect((await stranger.api.put(`appointments/${appointment.id}`, { data: { ...appointmentInput, status: 'cancelled' } })).status()).toBe(404);
  expect((await owner.api.get(`appointments/${appointment.id}`)).ok()).toBe(true);

  const feed = await (await owner.api.get('reminders')).json();
  const reminder = feed.reminders.find((item: { petId: number; source: string }) => item.petId === pet.id && item.source === 'APPOINTMENT');
  expect(reminder).toBeDefined();
  expect((await stranger.api.patch(`reminders/${reminder.id}`, { data: { action: 'complete' } })).status()).toBe(404);
  expect((await owner.api.patch(`reminders/${reminder.id}`, { data: { action: 'complete' } })).status()).toBe(204);
});

test('public health shares expose selected sections only and become unavailable after owner revocation', async ({ accounts, playwright }) => {
  const owner = await accounts.create();
  const stranger = await accounts.create();
  const pet = await createPet(owner.api, { allergies: 'Private allergy' });
  const shareResponse = await owner.api.post(`pets/${pet.id}/health-shares`, { data: { sections: ['identity'], expiresInHours: 1 } });
  expect(shareResponse.status()).toBe(201);
  const share = await shareResponse.json();
  const anonymous = await playwright.request.newContext({ baseURL: apiURL });
  try {
    const published = await anonymous.get(`shared-health/${share.token}`);
    expect(published.status()).toBe(200);
    expect(published.headers()['cache-control']).toBe('private, no-store');
    const html = await published.text();
    expect(html).toContain('Miso E2E');
    expect(html).not.toContain('Private allergy');
    expect((await stranger.api.delete(`health-shares/${share.id}`)).status()).toBe(404);
    expect((await anonymous.get(`shared-health/${share.token}`)).status()).toBe(200);
    expect((await owner.api.delete(`health-shares/${share.id}`)).status()).toBe(204);
    expect((await anonymous.get(`shared-health/${share.token}`)).status()).toBe(404);
  } finally { await anonymous.dispose(); }
});
