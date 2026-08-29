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
  const [date, setDate] = useState(() => inputDate(procedure.checkupDate));
  const [notes, setNotes] = useState(procedure.checkupNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
      setSubmitError(error instanceof Error ? error.message : 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      closeLabel="Cerrar edición del procedimiento"
      description={procedure.description ?? undefined}
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSaving}
      title={procedure.name}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-form__grid">
          <div className="form-field">
            <label className="form-label" htmlFor="procedure-date">Fecha de realización</label>
            <input
              className="form-control"
              disabled={isSaving}
              id="procedure-date"
              onChange={(event) => setDate(event.target.value)}
              onClick={openDatePicker}
              type="date"
              value={date}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="procedure-notes">
              Notas <span className="form-label__optional">(opcional)</span>
            </label>
            <textarea
              className="form-control"
              disabled={isSaving}
              id="procedure-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Añadir notas…"
              rows={3}
              value={notes}
            />
          </div>
        </div>

        {submitError && <p className="form-alert" role="alert">{submitError}</p>}

        <div className="modal-form__actions">
          <button className="ui-button ui-button--secondary" disabled={isSaving} onClick={onClose} type="button">
            Cancelar
          </button>
          <button aria-busy={isSaving || undefined} className="ui-button" disabled={isSaving} type="submit">
            {isSaving && <span aria-hidden="true" className="ui-spinner" />}
            {isSaving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ProcedureModal;
