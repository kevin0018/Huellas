import { messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
import { localeByLanguage } from '../i18n/locale';
import { useTranslation } from '../i18n/hooks/hook';
import { useEffect, useState, type FormEvent } from 'react';
import type { PetProcedure } from '../modules/pet/domain/PetProcedure';
import { Dialog } from '../shared/ui/Dialog';

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModalSubmit: (
    procedureId: number,
    checkupId?: number,
    checkupDate?: string,
    checkupNotes?: string,
  ) => Promise<void>;
  procedure: PetProcedure;
}

const inputDate = (value?: string) => value?.slice(0, 10) ?? '';

function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  try { event.currentTarget.showPicker?.(); }
  catch { event.currentTarget.focus(); }
}

const ProcedureModal = ({ isOpen, onClose, onModalSubmit, procedure }: ProcedureModalProps) => {
  const { translate, currentLanguage } = useTranslation();
  const [date, setDate] = useState(() => inputDate(procedure.checkupDate));
  const [notes, setNotes] = useState(procedure.checkupNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<LocalizedMessage | null>('');

  useEffect(() => {
    if (!isOpen) return;

    setDate(inputDate(procedure.checkupDate));
    setNotes(procedure.checkupNotes ?? '');
    setIsSaving(false);
    setSubmitError('');
  }, [isOpen, procedure]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError('');

    try {
      await onModalSubmit(
        procedure.id,
        procedure.checkupId,
        date || undefined,
        notes.trim() || undefined,
      );
      onClose();
    } catch (error) {
      setSubmitError(messageFromError(error, 'procedureSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      closeLabel={translate('closeProcedureForm')}
      description={procedure.description ?? undefined}
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSaving}
      title={procedure.name}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-form__grid">
          <div className="form-field">
            <label className="form-label" htmlFor="procedure-date">{translate('procedureDate')}</label>
            <input
              className="form-control"
              disabled={isSaving}
              id="procedure-date"
              onChange={(event) => setDate(event.target.value)}
              onClick={openDatePicker}
              type="date"
              lang={localeByLanguage[currentLanguage]}
              value={date}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="procedure-notes">
              {translate('healthNotes')} <span className="form-label__optional">({translate('optional')})</span>
            </label>
            <textarea
              className="form-control"
              disabled={isSaving}
              id="procedure-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder={translate('procedureNotesPlaceholder')}
              rows={3}
              value={notes}
            />
          </div>
        </div>

        {submitError && <p className="form-alert" role="alert">{translateMessage(submitError, translate)}</p>}

        <div className="modal-form__actions">
          <button className="ui-button ui-button--secondary" disabled={isSaving} onClick={onClose} type="button">
            {translate('cancel')}
          </button>
          <button aria-busy={isSaving || undefined} className="ui-button" disabled={isSaving} type="submit">
            {isSaving && <span aria-hidden="true" className="ui-spinner" />}
            {isSaving ? translate('saving') : translate('saveChanges')}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ProcedureModal;
