import { LocalizedError, translateMessage, type LocalizedMessage } from '../i18n/message';
import { useTranslation } from '../i18n/hooks/hook';
import { useEffect, useId, useState } from 'react';
import { Dialog } from '../shared/ui/Dialog';

interface VolunteerModalProps {
  isOpen: boolean;
  isCurrentlyVolunteer: boolean;
  onConfirm: (description?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VolunteerModal({
  isOpen,
  isCurrentlyVolunteer,
  onConfirm,
  onCancel,
  isLoading = false,
}: VolunteerModalProps) {
  const { translate } = useTranslation();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<LocalizedMessage>('');
  const helpId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!isOpen) return;
    setDescription('');
    setError('');
  }, [isCurrentlyVolunteer, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDescription = description.trim();
    if (!isCurrentlyVolunteer && !normalizedDescription) {
      setError({ translationKey: 'volunteerDescriptionRequired' });
      return;
    }

    try {
      setError('');
      await onConfirm(isCurrentlyVolunteer ? undefined : normalizedDescription);
    } catch (reason) {
      setError(reason instanceof LocalizedError
        ? { translationKey: reason.translationKey }
        : reason instanceof Error ? reason.message : { translationKey: 'volunteerActionError' });
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    onCancel();
  };

  const title = isCurrentlyVolunteer
    ? translate('leaveVolunteerTitle')
    : translate('becomeVolunteerTitle');
  const dialogDescription = isCurrentlyVolunteer
    ? translate('leaveVolunteerDescription')
    : translate('becomeVolunteerDescription');

  return (
    <Dialog
      description={dialogDescription}
      isOpen={isOpen}
      onClose={handleCancel}
      preventClose={isLoading}
      title={title}
    >
      <form className="modal-form" noValidate onSubmit={handleSubmit}>
        {!isCurrentlyVolunteer && (
          <div className="form-field">
            <label className="form-label" htmlFor="volunteer-description">
              {translate('description')} <span aria-hidden="true">*</span>
            </label>
            <textarea
              aria-describedby={error ? `${helpId} ${errorId}` : helpId}
              aria-invalid={Boolean(error)}
              className="form-control"
              data-dialog-initial-focus
              disabled={isLoading}
              id="volunteer-description"
              onChange={(event) => {
                setDescription(event.target.value);
                if (error) setError('');
              }}
              placeholder={translate('volunteerExperienceExample')}
              required
              rows={4}
              value={description}
            />
            <p className="form-help" id={helpId}>
              {translate('volunteerExperienceHelp')}
            </p>
          </div>
        )}

        {error && (
          <p className="form-alert" id={errorId} role="alert">
            {translateMessage(error, translate)}
          </p>
        )}

        <div className="modal-form__actions">
          <button
            className="ui-button ui-button--secondary"
            data-dialog-initial-focus={isCurrentlyVolunteer ? true : undefined}
            disabled={isLoading}
            onClick={handleCancel}
            type="button"
          >
            {translate('cancel')}
          </button>
          <button
            aria-busy={isLoading || undefined}
            className={`ui-button${isCurrentlyVolunteer ? ' ui-button--danger' : ''}`}
            disabled={isLoading}
            type="submit"
          >
            {isLoading && <span aria-hidden="true" className="ui-spinner" />}
            {isLoading
              ? translate('processing')
              : isCurrentlyVolunteer
                ? translate('confirmLeaveVolunteer')
                : translate('confirmBecomeVolunteer')}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
