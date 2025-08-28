import React from 'react';
import type { Appointment } from '../modules/appointment/domain/Appointment.js';
import type { Pet } from '../modules/pet/domain/Pet.js';
import { getAppointmentReasonLabel, getAppointmentReasonColor } from '../modules/appointment/domain/Appointment.js';

interface AppointmentCardProps {
  appointment: Appointment;
  pet?: Pet;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: number) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  pet,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/90 dark:bg-[#51344D]/90 rounded-xl shadow-lg border border-[#51344D]/20 dark:border-[#FDF2DE]/20 p-6 mx-1 mb-4 themed-card-invL">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-caprasimo text-[#51344D] dark:text-[#FDF2DE]">
              {pet ? pet.name : `Mascota ID: ${appointment.petId}`}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentReasonColor(appointment.reason)}`}>
              {getAppointmentReasonLabel(appointment.reason)}
            </span>
          </div>
          <div className="text-sm text-[#928d8e] dark:text-[#BAA9CB] mb-2">
            {formatDate(appointment.date)} a las {formatTime(appointment.date)}
          </div>
          {appointment.notes && (
            <p className="text-sm text-[#51344D] dark:text-[#FDF2DE] bg-[#FDF2DE]/50 dark:bg-[#51344D]/30 p-2 rounded">
              {appointment.notes}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              className="
                p-2 text-[#51344D] hover:text-[#9886AD] dark:text-[#FDF2DE] 
                dark:hover:text-[#BAA9CB] transition-colors"
              title="Editar cita" /* TODO: Add to translation dictionary */
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(appointment.id)}
              className="
                p-2 text-red-500 hover:text-red-700 dark:text-red-400 
                dark:hover:text-red-300 transition-colors
              "
              title="Eliminar cita" /* TODO: Add to translation dictionary */
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
