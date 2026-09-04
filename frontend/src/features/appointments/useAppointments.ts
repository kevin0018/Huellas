import { messageFromError, translateMessage, type LocalizedMessage } from '../../i18n/message';
import { useTranslation } from '../../i18n/hooks/hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Appointment,
  AppointmentReason,
  AppointmentStatus,
} from '../../modules/appointment/domain/Appointment';
import { ApiAppointmentRepository } from '../../modules/appointment/infra/ApiAppointmentRepository';
import type { Pet } from '../../modules/pet/domain/Pet';
import { ApiPetRepository } from '../../modules/pet/infra/ApiPetRepository';

export type SaveAppointment = {
  petId: number;
  date: string;
  reason: AppointmentReason;
  status: AppointmentStatus;
  notes?: string | null;
};

const appointmentRepository = new ApiAppointmentRepository();
const petRepository = new ApiPetRepository();

export function useAppointments() {
  const { translate } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<LocalizedMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextAppointments, nextPets] = await Promise.all([
        appointmentRepository.getAppointments(),
        petRepository.getUserPets(),
      ]);
      setAppointments(nextAppointments);
      setPets(nextPets);
    } catch (loadError) {
      setError(messageFromError(loadError, 'loadAppointmentsError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (data: SaveAppointment, editing?: Appointment) => {
    setActionLoading(true);
    setError(null);
    try {
      if (editing) {
        const updated = await appointmentRepository.updateAppointment(editing.id, {
          date: data.date,
          reason: data.reason,
          status: data.status,
          notes: data.notes,
        });
        setAppointments((current) => current.map((item) => item.id === updated.id ? updated : item));
      } else {
        const created = await appointmentRepository.createAppointment({
          petId: data.petId,
          date: data.date,
          reason: data.reason,
          notes: data.notes,
        });
        setAppointments((current) => [...current, created]);
      }
    } catch (saveError) {
      setError(messageFromError(saveError, 'saveAppointmentError'));
      throw saveError;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      await appointmentRepository.deleteAppointment(id);
      setAppointments((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(messageFromError(deleteError, 'deleteAppointmentError'));
      throw deleteError;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const petById = useCallback((id: number) => pets.find((pet) => pet.id === id), [pets]);

  return useMemo(() => ({
    appointments,
    pets,
    loading,
    actionLoading,
    error: translateMessage(error, translate),
    clearError: () => setError(null),
    reload: load,
    save,
    remove,
    petById,
  }), [actionLoading, appointments, error, load, loading, petById, pets, remove, save, translate]);
}
