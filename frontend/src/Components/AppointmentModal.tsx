import React, { useEffect, useRef, useState } from 'react';
import type { Pet } from '../modules/pet/domain/Pet.js';
import type { Appointment, AppointmentReason, AppointmentStatus } from '../modules/appointment/domain/Appointment.js';
import { AppointmentReason as AppointmentReasonEnum, AppointmentStatus as AppointmentStatusEnum, getAppointmentReasonLabel, getAppointmentStatusLabel } from '../modules/appointment/domain/Appointment.js';
import { Dialog } from '../shared/ui/Dialog.js';
import PetSelector from './PetSelector.js';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: {
    petId: number;
    date: string;
    reason: AppointmentReason;
    status: AppointmentStatus;
    notes?: string | null;
  }) => void;
  pets: Pet[];
  appointment?: Appointment;
  loading?: boolean;
  error?: string;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function openNativePicker(event: React.MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker?.();
  } catch {
    event.currentTarget.focus();
  }
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pets,
  appointment,
  loading = false,
  error,
}) => {
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(appointment?.petId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedReason, setSelectedReason] = useState<AppointmentReason | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(AppointmentStatusEnum.SCHEDULED);
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [showValidation, setShowValidation] = useState(false);
  const petSelectRef = useRef<HTMLSelectElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowValidation(false);

    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      setSelectedPetId(appointment.petId);
      setSelectedDate(formatLocalDate(appointmentDate));
      setSelectedTime(formatLocalTime(appointmentDate));
      setSelectedReason(appointment.reason);
      setSelectedStatus(appointment.status);
      setNotes(appointment.notes || '');
      return;
    }

    setSelectedPetId(undefined);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedReason('');
    setSelectedStatus(AppointmentStatusEnum.SCHEDULED);
    setNotes('');
  }, [appointment, isOpen]);

  const missingPet = !selectedPetId;
  const missingDate = !selectedDate;
  const missingTime = !selectedTime;
  const missingReason = !selectedReason;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowValidation(true);

    if (missingPet || missingDate || missingTime || missingReason || loading) return;

    const fullDate = new Date(`${selectedDate}T${selectedTime}`);
    onSubmit({
      petId: selectedPetId,
      date: fullDate.toISOString(),
      reason: selectedReason as AppointmentReason,
      status: selectedStatus,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog
      closeLabel="Cerrar formulario de cita"
      description={appointment
        ? 'Actualiza los datos y el estado de esta cita.'
        : 'Programa una visita para una de tus mascotas.'}
      initialFocusRef={appointment ? dateInputRef : petSelectRef}
      isOpen={isOpen}
      onClose={onClose}
      preventClose={loading}
      size="large"
      title={appointment ? 'Editar cita' : 'Nueva cita'}
    >
      <form aria-busy={loading || undefined} className="modal-form" noValidate onSubmit={handleSubmit}>
        {error && <div className="form-alert" role="alert">{error}</div>}

        <PetSelector
          disabled={Boolean(appointment) || loading}
          error={showValidation && missingPet ? 'Selecciona una mascota.' : undefined}
          inputRef={petSelectRef}
          onPetSelect={setSelectedPetId}
          pets={pets}
          required
          selectedPetId={selectedPetId}
        />

        <div className="modal-form__grid">
          <div className="form-field">
            <label className="form-label" htmlFor="appointment-date">Fecha</label>
            <input
              aria-describedby={showValidation && missingDate ? 'appointment-date-error' : undefined}
              aria-invalid={showValidation && missingDate || undefined}
              className="form-control"
              disabled={loading}
              id="appointment-date"
              min={appointment ? undefined : formatLocalDate(new Date())}
              onChange={(event) => setSelectedDate(event.target.value)}
              onClick={openNativePicker}
              ref={dateInputRef}
              required
              type="date"
              value={selectedDate}
            />
            {showValidation && missingDate && <span className="form-error" id="appointment-date-error">Selecciona una fecha.</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="appointment-time">Hora</label>
            <input
              aria-describedby={showValidation && missingTime ? 'appointment-time-error' : undefined}
              aria-invalid={showValidation && missingTime || undefined}
              className="form-control"
              disabled={loading}
              id="appointment-time"
              onChange={(event) => setSelectedTime(event.target.value)}
              onClick={openNativePicker}
              required
              step={1800}
              type="time"
              value={selectedTime}
            />
            {showValidation && missingTime && <span className="form-error" id="appointment-time-error">Selecciona una hora.</span>}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="appointment-reason">Motivo de la cita</label>
          <select
            aria-describedby={showValidation && missingReason ? 'appointment-reason-error' : undefined}
            aria-invalid={showValidation && missingReason || undefined}
            className="form-control"
            disabled={loading}
            id="appointment-reason"
            onChange={(event) => setSelectedReason(event.target.value as AppointmentReason)}
            required
            value={selectedReason}
          >
            <option value="">Selecciona un motivo...</option>
            {Object.values(AppointmentReasonEnum).map((reason) => (
              <option key={reason} value={reason}>{getAppointmentReasonLabel(reason)}</option>
            ))}
          </select>
          {showValidation && missingReason && <span className="form-error" id="appointment-reason-error">Selecciona un motivo.</span>}
        </div>

        {appointment && (
          <div className="form-field">
            <label className="form-label" htmlFor="appointment-status">Estado</label>
            <select
              className="form-control"
              disabled={loading}
              id="appointment-status"
              onChange={(event) => setSelectedStatus(event.target.value as AppointmentStatus)}
              value={selectedStatus}
            >
              {Object.values(AppointmentStatusEnum).map((status) => (
                <option key={status} value={status}>{getAppointmentStatusLabel(status)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field">
          <label className="form-label" htmlFor="appointment-notes">
            Notas adicionales <span className="form-label__optional">(opcional)</span>
          </label>
          <textarea
            className="form-control"
            disabled={loading}
            id="appointment-notes"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Información adicional sobre la cita"
            rows={3}
            value={notes}
          />
        </div>

        <div className="modal-form__actions">
          <button className="ui-button ui-button--secondary" disabled={loading} onClick={onClose} type="button">
            Cancelar
          </button>
          <button aria-busy={loading || undefined} className="ui-button" disabled={loading} type="submit">
            {loading && <span aria-hidden="true" className="ui-spinner" />}
            {loading ? 'Guardando…' : appointment ? 'Actualizar cita' : 'Crear cita'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default AppointmentModal;
