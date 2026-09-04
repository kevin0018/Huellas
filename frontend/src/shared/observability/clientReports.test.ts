// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { installClientErrorReporting, reportClientFailure } from './clientReports';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('sends only coarse categories and validated IDs, without credentials or referrer', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(600000);
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetch);
  reportClientFailure('render', 'private health record');
  reportClientFailure('render');
  expect(fetch).toHaveBeenCalledOnce();
  const init = fetch.mock.calls[0][1];
  expect(JSON.parse(init.body)).toEqual({ kind: 'render' });
  expect(init.credentials).toBe('omit');
  expect(init.referrerPolicy).toBe('no-referrer');
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  const id = 'de6712c8-d2ae-4ee0-9c7a-c248a319c72d';
  reportClientFailure('http_5xx', id);
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ kind: 'http_5xx', requestId: id });
});
it('ignores collector failures, throttles repeated errors and cleans up listeners', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(1200000);
  const fetch = vi.fn().mockRejectedValue(new Error('private collector failure'));
  vi.stubGlobal('fetch', fetch);
  const dispose = installClientErrorReporting();
  window.dispatchEvent(new ErrorEvent('error', { message: 'private diagnosis', filename: '/pets/private-id', error: new Error('private stack') }));
  window.dispatchEvent(new ErrorEvent('error'));
  await Promise.resolve();
  expect(fetch).toHaveBeenCalledOnce();
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ kind: 'runtime' });
  dispose();
  vi.spyOn(Date, 'now').mockReturnValue(1800000);
  window.dispatchEvent(new ErrorEvent('error'));
  expect(fetch).toHaveBeenCalledOnce();
});
