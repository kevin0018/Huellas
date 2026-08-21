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
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
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
      setError('La descripción es obligatoria para ser voluntario.');
      return;
    }

    try {
      setError('');
      await onConfirm(isCurrentlyVolunteer ? undefined : normalizedDescription);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ha ocurrido un error.');
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    onCancel();
  };

  const title = isCurrentlyVolunteer
    ? '¿Dejar de ser voluntario?'
    : '¡Conviértete en voluntario!';
  const dialogDescription = isCurrentlyVolunteer
    ? 'Perderás el acceso a las funciones de voluntariado.'
    : 'Cuéntanos sobre tu experiencia, motivación y habilidades con animales.';

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
              Descripción <span aria-hidden="true">*</span>
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
              placeholder="Por ejemplo: tengo experiencia cuidando perros y gatos."
              required
              rows={4}
              value={description}
            />
            <p className="form-help" id={helpId}>
              Comparte cualquier experiencia o habilidad relevante.
            </p>
          </div>
        )}

        {error && (
          <p className="form-alert" id={errorId} role="alert">
            {error}
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
            Cancelar
          </button>
          <button
            aria-busy={isLoading || undefined}
            className={`ui-button${isCurrentlyVolunteer ? ' ui-button--danger' : ''}`}
            disabled={isLoading}
            type="submit"
          >
            {isLoading && <span aria-hidden="true" className="ui-spinner" />}
            {isLoading
              ? 'Procesando…'
              : isCurrentlyVolunteer
                ? 'Sí, dejar de ser voluntario'
                : 'Quiero ser voluntario'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
