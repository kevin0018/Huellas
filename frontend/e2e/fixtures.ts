import { randomUUID } from 'node:crypto';
import { test as base, expect, type APIRequestContext } from '@playwright/test';

type Account = { id: number; email: string; password: string; api: APIRequestContext };
type Accounts = { create: () => Promise<Account> };
export const apiURL = 'http://127.0.0.1:3001/api/';

export const test = base.extend<{ accounts: Accounts }>({
  accounts: async ({ playwright }, provide) => {
    const created: Account[] = [];
    const anonymous = await playwright.request.newContext({ baseURL: apiURL });
    let cleanupFailures: PromiseRejectedResult[] = [];
    try {
      await provide({ create: async () => {
        const email = `e2e-${randomUUID()}@example.com`;
        const password = 'Huellas-e2e-123!';
        const registration = await anonymous.post('owners/register', {
          data: { name: 'E2E', lastName: 'Owner', email, password },
        });
        expect(registration.status()).toBe(201);
        const { data: { id } } = await registration.json();
        const login = await anonymous.post('auth/login', { data: { email, password } });
        expect(login.ok()).toBe(true);
        const { token } = await login.json();
        const api = await playwright.request.newContext({ baseURL: apiURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
        const account = { id, email, password, api };
        created.push(account);
        return account;
      } });
    } finally {
      // This also verifies account deletion with health events and documents in MySQL.
      const cleanup = await Promise.allSettled(created.map(async (account) => {
        try {
          const result = await account.api.delete(`owners/${account.id}`);
          expect(result.status(), await result.text()).toBe(200);
        } finally { await account.api.dispose(); }
      }));
      await anonymous.dispose();
      cleanupFailures = cleanup.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    }
    if (cleanupFailures.length) throw new AggregateError(cleanupFailures.map(result => result.reason), 'E2E account cleanup failed');
  },
});
export { expect };

export async function createPet(api: APIRequestContext, extra: Record<string, unknown> = {}) {
  const response = await api.post('pets', { data: {
    name: 'Miso E2E', type: 'cat', birthDate: '2020-04-03', size: 'small', sex: 'female', hasPassport: false,
    ...extra,
  } });
  expect(response.status()).toBe(201);
  return await response.json() as { id: number; name: string };
}
