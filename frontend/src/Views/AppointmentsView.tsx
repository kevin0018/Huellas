/* Hallmark · genre: playful · macrostructure: Index-First · theme: Huellas · enrichment: existing pattern · nav/footer: preserved · critique: P5 H5 E4 S5 R5 V5 */
import { useState } from 'react';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import GoBackButton from '../Components/GoBackButton.js';
import AppointmentCard from '../Components/AppointmentCard';
import AppointmentModal from '../Components/AppointmentModal';
import { AppointmentStatus, type Appointment } from '../modules/appointment/domain/Appointment.js';
import { useAppointments, type SaveAppointment } from '../features/appointments/useAppointments.js';
import { AsyncContent } from '../shared/ui/AsyncContent.js';

function AddIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
    </svg>
  );
}

function appointmentCount(count: number) {
  return `${count} ${count === 1 ? 'cita' : 'citas'}`;
}

function AppointmentsView() {
  const { appointments, pets, loading, actionLoading, error, clearError, reload, save, remove, petById } = useAppointments();
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
    clearError();
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      return;
    }

    try {
      await remove(appointmentId);
    } catch {
      // The feature hook owns and exposes the user-facing error state.
    }
  };

  const handleCloseModal = () => {
    if (actionLoading) return;
    clearError();
    setIsModalOpen(false);
    setEditingAppointment(undefined);
  };

  const handleOpenModal = () => {
    clearError();
    setEditingAppointment(undefined);
    setIsModalOpen(true);
  };

  const now = Date.now();
  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === AppointmentStatus.SCHEDULED && new Date(appointment.date).getTime() >= now)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
  const upcomingIds = new Set(upcomingAppointments.map((appointment) => appointment.id));
  const historyAppointments = appointments
    .filter((appointment) => !upcomingIds.has(appointment.id))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100dvh-var(--nav-height))] bg-[var(--color-paper)] text-[var(--color-ink)]">
        <div aria-hidden="true" className="bg-dogs-userhome-mobile pointer-events-none fixed inset-0 bg-repeat opacity-60 md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop" />

        <div className="relative z-10 mx-auto w-full max-w-[var(--page-max)] px-[var(--page-gutter)] py-8 sm:py-12">
          <GoBackButton className="w-fit bg-[var(--color-surface-raised)]" variant="outline" hideIfNoHistory />

          <header className="mt-6 flex flex-col gap-5 border-b border-[var(--color-rule-strong)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-caprasimo text-4xl text-[var(--color-ink)] sm:text-5xl">Mis citas</h1>
              <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
                Consulta lo próximo y conserva el historial de cada mascota.
              </p>
            </div>

            <div className="shrink-0">
              <button
                aria-describedby={pets.length === 0 ? 'appointment-create-help' : undefined}
                className="ui-button w-full whitespace-nowrap sm:w-auto"
                disabled={pets.length === 0 || actionLoading}
                onClick={handleOpenModal}
                type="button"
              >
                <AddIcon />
                Nueva cita
              </button>
              {pets.length === 0 && (
                <p className="mt-2 max-w-72 text-sm text-[var(--color-warning)]" id="appointment-create-help">
                  Añade una mascota antes de crear una cita.
                </p>
              )}
            </div>
          </header>

          <div className="mt-8">
            <AsyncContent
              loading={loading}
              error={error}
              empty={appointments.length === 0}
              loadingLabel="Cargando citas…"
              emptyTitle="Todavía no tienes citas"
              emptyDescription={pets.length > 0
                ? 'Crea una cita para empezar a organizar las próximas visitas.'
                : 'Añade una mascota para poder programar su primera visita.'}
              onRetry={reload}
            >
              <div className="grid gap-10">
                <section aria-labelledby="upcoming-appointments-title">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-nunito text-2xl font-bold tracking-normal" id="upcoming-appointments-title">Próximas citas</h2>
                      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">La visita más cercana aparece primero.</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-[var(--color-muted)]">{appointmentCount(upcomingAppointments.length)}</p>
                  </div>

                  {upcomingAppointments.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] shadow-[var(--shadow-card)]">
                      {upcomingAppointments.map((appointment, index) => (
                        <AppointmentCard
                          actionsDisabled={actionLoading}
                          appointment={appointment}
                          emphasis={index === 0}
                          key={appointment.id}
                          onDelete={handleDeleteAppointment}
                          onEdit={handleEditAppointment}
                          pet={petById(appointment.petId)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-[var(--radius-control)] border border-dashed border-[var(--color-rule-strong)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-ink-soft)]" role="status">
                      No hay citas próximas. Cuando programes una visita, aparecerá aquí.
                    </p>
                  )}
                </section>

                {historyAppointments.length > 0 && (
                  <section aria-labelledby="appointment-history-title">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2 className="font-nunito text-2xl font-bold tracking-normal" id="appointment-history-title">Historial</h2>
                        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Visitas pasadas, completadas o canceladas.</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-[var(--color-muted)]">{appointmentCount(historyAppointments.length)}</p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
                      {historyAppointments.map((appointment) => (
                        <AppointmentCard
                          actionsDisabled={actionLoading}
                          appointment={appointment}
                          key={appointment.id}
                          onDelete={handleDeleteAppointment}
                          onEdit={handleEditAppointment}
                          pet={petById(appointment.petId)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </AsyncContent>
          </div>
        </div>

        <AppointmentModal
          appointment={editingAppointment}
          error={error ?? undefined}
          isOpen={isModalOpen}
          loading={actionLoading}
          onClose={handleCloseModal}
          onSubmit={handleSaveAppointment}
          pets={pets}
        />
      </main>
      <Footer />
    </>
  );
}

export default AppointmentsView;
