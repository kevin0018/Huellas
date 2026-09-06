import { ApiError } from '../shared/api/response';
import { ClientError, type ClientErrorCode } from '../shared/errors/ClientError';
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

const clientErrorKeys: Record<Exclude<ClientErrorCode, 'REQUEST_FAILED'>, TranslationKey> = {
  NETWORK: 'networkError',
  AUTH_REQUIRED: 'authenticationRequired',
  PASSWORD_UNCHANGED: 'passwordUnchanged',
  VOLUNTEER_DESCRIPTION_REQUIRED: 'volunteerDescriptionRequired',
  READ_FILE_FAILED: 'readFileError',
  LOAD_REMINDERS: 'loadRemindersError',
  UPDATE_REMINDER: 'updateReminderError',
  SAVE_REMINDER_PREFERENCES: 'saveReminderPreferencesError',
};

/** Resolve only known local errors; never guess a translation from server text. */
export function messageFromError(error: unknown, fallback: TranslationKey): LocalizedMessage {
  if (error instanceof LocalizedError) return { translationKey: error.translationKey };
  const code = error instanceof ClientError ? error.code : error instanceof ApiError ? error.fallbackCode : undefined;
  if (code) return { translationKey: code === 'REQUEST_FAILED' ? fallback : clientErrorKeys[code] };
  if (error instanceof Error && error.message) return error.message;
  return { translationKey: fallback };
}
