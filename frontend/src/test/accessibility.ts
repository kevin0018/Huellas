import axe from 'axe-core';
import { expect } from 'vitest';

export async function expectNoCriticalAccessibilityViolations(container: Element) {
  const result = await axe.run(container, {
    rules: {
      // jsdom does not calculate painted colours; contrast is verified in the browser pass.
      'color-contrast': { enabled: false },
    },
  });
  const violations = result.violations
    .filter(({ impact }) => impact === 'critical' || impact === 'serious')
    .map(({ id, help, nodes }) => ({
      help,
      id,
      targets: nodes.map(({ target }) => target.join(' ')),
    }));

  expect(violations).toEqual([]);
}
