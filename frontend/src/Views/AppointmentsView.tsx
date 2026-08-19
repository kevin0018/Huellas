import { useState } from 'react';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import GoBackButton from '../Components/GoBackButton.js';
import AppointmentCard from '../Components/AppointmentCard';
import AppointmentModal from '../Components/AppointmentModal';
import { AppointmentStatus, type Appointment } from '../modules/appointment/domain/Appointment.js';
import { useAppointments, type SaveAppointment } from '../features/appointments/useAppointments.js';
import { AsyncContent } from '../shared/ui/AsyncContent.js';

function AppointmentsView() {
  const { appointments, pets, loading, actionLoading, error, reload, save, remove, petById } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  const handleSaveAppointment = async (appointmentData: SaveAppointment) => {
    try {
      await save(appointmentData, editingAppointment);
      setIsModalOpen(false);
      setEditingAppointment(undefined);
    } catch {
      // The feature hook owns and exposes the user-facing error state.
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
      await remove(appointmentId);
    } catch {
      // The feature hook owns and exposes the user-facing error state.
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
  };

  const now = Date.now();
  const sortedAppointments = [...appointments].sort((left, right) => {
    const leftUpcoming = left.status === AppointmentStatus.SCHEDULED && new Date(left.date).getTime() >= now;
    const rightUpcoming = right.status === AppointmentStatus.SCHEDULED && new Date(right.date).getTime() >= now;
    if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
    return leftUpcoming
      ? new Date(left.date).getTime() - new Date(right.date).getTime()
      : new Date(right.date).getTime() - new Date(left.date).getTime();
  });

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
            <div className="w-full text-left max-w-4xl mx-auto">
              <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
            </div>
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

          <AsyncContent
            loading={loading}
            error={error}
            empty={appointments.length === 0}
            loadingLabel="Cargando citas..."
            emptyTitle="No tienes citas programadas"
            emptyDescription={pets.length > 0
              ? 'Crea tu primera cita médica para tus mascotas'
              : 'Necesitas registrar una mascota antes de poder crear citas'}
            onRetry={reload}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  pet={petById(appointment.petId)}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                />
              ))}
            </div>
          </AsyncContent>
        </div>

        {/* Modal */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveAppointment}
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
