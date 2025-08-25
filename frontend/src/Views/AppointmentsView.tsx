import { useState, useEffect } from 'react';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import AppointmentCard from '../Components/AppointmentCard';
import AppointmentModal from '../Components/AppointmentModal';
import type { Appointment, AppointmentReason } from '../modules/appointment/domain/Appointment.js';
import type { Pet } from '../modules/pet/domain/Pet.js';

// Appointment imports
import { ApiAppointmentRepository } from '../modules/appointment/infra/ApiAppointmentRepository.js';
import { GetAppointmentsQuery } from '../modules/appointment/application/queries/GetAppointmentsQuery.js';
import { GetAppointmentsQueryHandler } from '../modules/appointment/application/queries/GetAppointmentsQueryHandler.js';
import { CreateAppointmentCommand } from '../modules/appointment/application/commands/CreateAppointmentCommand.js';
import { CreateAppointmentCommandHandler } from '../modules/appointment/application/commands/CreateAppointmentCommandHandler.js';

// Pet imports
import { ApiPetRepository } from '../modules/pet/infra/ApiPetRepository.js';
import { GetUserPetsQuery } from '../modules/pet/application/GetUserPetsQuery.js';
import { GetUserPetsQueryHandler } from '../modules/pet/application/GetUserPetsQueryHandler.js';

function AppointmentsView() {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [actionLoading, setActionLoading] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create handlers on demand
      const appointmentRepository = new ApiAppointmentRepository();
      const petRepository = new ApiPetRepository();
      const getAppointmentsHandler = new GetAppointmentsQueryHandler(appointmentRepository);
      const getPetsHandler = new GetUserPetsQueryHandler(petRepository);
      
      const [appointmentsResult, petsResult] = await Promise.all([
        getAppointmentsHandler.execute(new GetAppointmentsQuery()),
        getPetsHandler.execute(new GetUserPetsQuery())
      ]);
      
      setAppointments(appointmentsResult);
      setPets(petsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido'); // TODO: Add to translation dictionary
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = async (appointmentData: {
    petId: number;
    date: string;
    reason: AppointmentReason;
    notes?: string;
  }) => {
    try {
      setActionLoading(true);
      
      const appointmentRepository = new ApiAppointmentRepository();
      const createAppointmentHandler = new CreateAppointmentCommandHandler(appointmentRepository);
      
      const command = new CreateAppointmentCommand(
        appointmentData.petId,
        appointmentData.date,
        appointmentData.reason,
        appointmentData.notes
      );
      
      const newAppointment = await createAppointmentHandler.execute(command);
      setAppointments(prev => [...prev, newAppointment]);
      setIsModalOpen(false);
      setEditingAppointment(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cita'); // TODO: Add to translation dictionary
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) { // TODO: Add to translation dictionary
      return;
    }
    
    try {
      setActionLoading(true);
      const appointmentRepository = new ApiAppointmentRepository();
      await appointmentRepository.deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cita'); // TODO: Add to translation dictionary
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
  };

  const getPetById = (petId: number): Pet | undefined => {
    return pets.find(pet => pet.id === petId);
  };

  // Sort appointments by date (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#FDF2DE] dark:bg-[#51344D] relative">
        {/* Background pattern */}
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-caprasimo mb-4 text-[#51344D] dark:text-[#FDF2DE] drop-shadow-lg">
              Mis Citas {/* TODO: Add to translation dictionary */}
            </h1>
            <p className="text-lg text-[#928d8e] dark:text-[#BAA9CB] mb-6">
              Gestiona las citas médicas de tus mascotas {/* TODO: Add to translation dictionary */}
            </p>
            
            {/* Create appointment button */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={pets.length === 0 || actionLoading}
              className="
                inline-flex items-center gap-3 px-6 py-3
                bg-[#51344D] dark:bg-[#FDF2DE] text-[#FDF2DE] dark:text-[#51344D] 
                font-semibold rounded-lg shadow-lg
                hover:bg-[#9886AD] dark:hover:bg-[#BAA9CB] 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51344D]
                transition-all duration-300 ease-in-out transform hover:scale-105
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none
                font-nunito
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cita {/* TODO: Add to translation dictionary */}
            </button>
            
            {pets.length === 0 && (
              <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                Necesitas registrar al menos una mascota para crear citas {/* TODO: Add to translation dictionary */}
              </p>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#51344D] dark:border-[#FDF2DE]"></div>
              <span className="ml-3 text-[#51344D] dark:text-[#FDF2DE]">Cargando citas...</span> {/* TODO: Add to translation dictionary */}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Cerrar {/* TODO: Add to translation dictionary */}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && appointments.length === 0 && !error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-caprasimo text-[#51344D] dark:text-[#FDF2DE] mb-2">
                No tienes citas programadas {/* TODO: Add to translation dictionary */}
              </h3>
              <p className="text-[#928d8e] dark:text-[#BAA9CB]">
                {pets.length > 0 
                  ? "Crea tu primera cita médica para tus mascotas" 
                  : "Necesitas registrar una mascota antes de poder crear citas"} {/* TODO: Add to translation dictionary */}
              </p>
            </div>
          )}

          {/* Appointments grid */}
          {!loading && appointments.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  pet={getPetById(appointment.petId)}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateAppointment}
          pets={pets}
          appointment={editingAppointment}
          loading={actionLoading}
        />
      </div>
      <Footer />
    </>
  );
}

export default AppointmentsView;
