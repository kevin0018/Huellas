import type { TranslationKey } from './dictionary';
import type { TranslatorContextValue } from './TranslatorContext';

/** API messages remain verbatim; local messages are translated when rendered. */
export type LocalizedMessage = string | { translationKey: TranslationKey };

/** Preserve a local error key when a form delegates an action to its parent. */
export class LocalizedError extends Error {
  readonly translationKey: TranslationKey;

  constructor(translationKey: TranslationKey) {
    super(translationKey);
    this.name = 'LocalizedError';
    this.translationKey = translationKey;
  }
}

export function translateMessage(
  message: LocalizedMessage | null,
  translate: TranslatorContextValue['translate'],
): string | null {
  return message && typeof message === 'object' ? translate(message.translationKey) : message;
}
