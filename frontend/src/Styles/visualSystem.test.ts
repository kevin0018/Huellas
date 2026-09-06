import { describe, expect, it } from 'vitest';

const sourceModules = import.meta.glob('../**/*.{ts,tsx}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const productionSources = Object.entries(sourceModules).filter(
  ([path]) => !/\.(?:test|spec)\.[jt]sx?$/.test(path),
);

function findViolations(pattern: RegExp) {
  return productionSources.flatMap(([path, source]) =>
    source
      .split('\n')
      .map((line, index) => ({ path, line: index + 1, value: line.trim() }))
      .filter(({ value }) => pattern.test(value)),
  );
}

describe('visual system contract', () => {
  it('keeps raw colors out of production TypeScript and JSX', () => {
    const rawColor = /#[\da-f]{3,8}\b|(?:rgb|hsl)a?\(/i;

    expect(findViolations(rawColor)).toEqual([]);
  });

  it('uses deliberate motion utilities instead of layout-jumping defaults', () => {
    const broadOrScalingTransition = /\btransition-all\b|\bhover:scale-105\b/;

    expect(findViolations(broadOrScalingTransition)).toEqual([]);
  });

  it('does not encode light and dark palette pairs in components', () => {
    const pairedPaletteClass = /\bdark:(?:bg|text|border|ring)-(?:white|black|gray|neutral|slate|red|green|blue|yellow|purple)(?:-\d+)?(?:\/\d+)?\b/;

    expect(findViolations(pairedPaletteClass)).toEqual([]);
  });
});
