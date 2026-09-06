import { describe, expect, it } from 'vitest';
import { en, translations, type TranslationKey } from './dictionary';

const placeholders = (text: string) => [...new Set(text.match(/\{\{\w+\}\}/g) ?? [])].sort();

describe('translation contracts', () => {
  it.each(['es', 'ca'] as const)('keeps interpolation variables and nonempty entries synchronized in %s', (language) => {
    for (const key of Object.keys(en) as TranslationKey[]) {
      expect(translations[language][key].trim(), `${language}.${key}`).not.toBe('');
      expect(placeholders(translations[language][key]), `${language}.${key}`).toEqual(placeholders(en[key]));
    }
  });
});
