import React, { useState, useEffect } from 'react';
import type { Pet } from '../modules/pet/domain/Pet.js';
import type { Appointment, AppointmentReason } from '../modules/appointment/domain/Appointment.js';
import { AppointmentReason as AppointmentReasonEnum, getAppointmentReasonLabel } from '../modules/appointment/domain/Appointment.js';
import PetSelector from './PetSelector.js';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: {
    petId: number;
    date: string;
    reason: AppointmentReason;
    notes?: string;
  }) => void;
  pets: Pet[];
  appointment?: Appointment; // For editing
  loading?: boolean;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pets,
  appointment,
  loading = false
}) => {
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(appointment?.petId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedReason, setSelectedReason] = useState<AppointmentReason | ''>('');
  const [notes, setNotes] = useState(appointment?.notes || '');

  // Reset form when modal opens/closes or appointment changes
  useEffect(() => {
    if (appointment) {
      setSelectedPetId(appointment.petId);
      const appointmentDate = new Date(appointment.date);
      setSelectedDate(appointmentDate.toISOString().split('T')[0]);
      setSelectedTime(appointmentDate.toTimeString().slice(0, 5));
      setSelectedReason(appointment.reason);
      setNotes(appointment.notes || '');
    } else {
      setSelectedPetId(undefined);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedReason('');
      setNotes('');
    }
  }, [appointment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPetId || !selectedDate || !selectedTime || !selectedReason) {
      return;
    }

    // Combine date and time
    const fullDate = new Date(`${selectedDate}T${selectedTime}`);
    
    onSubmit({
      petId: selectedPetId,
      date: fullDate.toISOString(),
      reason: selectedReason as AppointmentReason,
      notes: notes.trim() || undefined
    });
  };

  if (!isOpen) return null;

  // Generate time slots (every 30 minutes from 9:00 to 18:00)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-[#51344D] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-[#fdf2de]">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#51344D] border-b border-[#fdf2de] dark:border-[#fdf2de] px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-caprasimo text-[#51344D] dark:text-[#FDF2DE]">
              {appointment ? 'Editar Cita' : 'Nueva Cita'} {/* TODO: Add to translation dictionary */}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Selection */}
          <PetSelector
            pets={pets}
            selectedPetId={selectedPetId}
            onPetSelect={setSelectedPetId}
          />

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#51344D] dark:text-[#FDF2DE] font-caprasimo">
                Selecciona Fecha: {/* TODO: Add to translation dictionary */}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] 
                  focus:border-[#51344D] bg-white dark:bg-[#51344D] 
                  text-[#51344D] dark:text-[#FDF2DE] font-nunito
                "
                required
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#51344D] dark:text-[#FDF2DE] font-caprasimo">
                Selecciona Hora: {/* TODO: Add to translation dictionary */}
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] 
                  focus:border-[#51344D] bg-white dark:bg-[#51344D] 
                  text-[#51344D] dark:text-[#FDF2DE] font-nunito
                "
                required
              >
                <option value="">Selecciona una hora...</option> {/* TODO: Add to translation dictionary */}
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#51344D] dark:text-[#FDF2DE] font-caprasimo">
              Motivo de la Cita: {/* TODO: Add to translation dictionary */}
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value as AppointmentReason)}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] 
                focus:border-[#51344D] bg-white dark:bg-[#51344D] 
                text-[#51344D] dark:text-[#FDF2DE] font-nunito
              "
              required
            >
              <option value="">Selecciona un motivo...</option> {/* TODO: Add to translation dictionary */}
              {Object.values(AppointmentReasonEnum).map((reason) => (
                <option key={reason} value={reason}>
                  {getAppointmentReasonLabel(reason)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#51344D] dark:text-[#FDF2DE] font-caprasimo">
              Notas Adicionales: {/* TODO: Add to translation dictionary */}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Información adicional sobre la cita (opcional)..." /* TODO: Add to translation dictionary */
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] 
                focus:border-[#51344D] bg-white dark:bg-[#51344D] 
                text-[#51344D] dark:text-[#FDF2DE] font-nunito
                placeholder-gray-500 dark:placeholder-gray-400
              "
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-4 py-2 text-[#51344D] dark:text-[#FDF2DE] 
                border border-[#51344D] dark:border-[#FDF2DE] rounded-lg 
                hover:bg-[#51344D]/10 dark:hover:bg-[#FDF2DE]/10 
                transition-colors font-nunito
              "
            >
              Cancelar {/* TODO: Add to translation dictionary */}
            </button>
            <button
              type="submit"
              disabled={loading || !selectedPetId || !selectedDate || !selectedTime || !selectedReason}
              className="
                flex-1 px-4 py-2 bg-[#51344D] dark:bg-[#FDF2DE] 
                text-[#FDF2DE] dark:text-[#51344D] rounded-lg 
                hover:bg-[#9886AD] dark:hover:bg-[#BAA9CB] 
                disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors font-nunito font-medium
                flex items-center justify-center gap-2
              "
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {appointment ? 'Actualizar Cita' : 'Crear Cita'} {/* TODO: Add to translation dictionary */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
