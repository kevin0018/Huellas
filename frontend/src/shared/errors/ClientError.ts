export type ClientErrorCode =
  | 'NETWORK'
  | 'REQUEST_FAILED'
  | 'AUTH_REQUIRED'
  | 'PASSWORD_UNCHANGED'
  | 'VOLUNTEER_DESCRIPTION_REQUIRED'
  | 'READ_FILE_FAILED'
  | 'LOAD_REMINDERS'
  | 'UPDATE_REMINDER'
  | 'SAVE_REMINDER_PREFERENCES';

/** A local failure carries a code; presentation chooses its translated message. */
export class ClientError extends Error {
  readonly code: ClientErrorCode;

  constructor(code: ClientErrorCode, options: { cause?: unknown } = {}) {
    super(code, { cause: options.cause });
    this.name = 'ClientError';
    this.code = code;
  }
}
