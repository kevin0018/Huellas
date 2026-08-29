import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import VolunteerModal from "../Components/VolunteerModal";
import { authActions } from '../features/auth/authActions';
import type { User } from '../modules/auth/domain/User';
import { isVolunteer, isOwner } from '../modules/auth/domain/User';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [pendingVolunteerChange, setPendingVolunteerChange] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    isVolunteer: false,
    description: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userSession = await authActions.currentUser();
        if (userSession) {
          setUser(userSession);
          setFormData({
            name: userSession.name,
            lastName: userSession.lastName,
            email: userSession.email,
            isVolunteer: isVolunteer(userSession),
            description: userSession.description || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        navigate('/');
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Helper function to show toast message
  const showToastMessage = () => {
    setShowSuccessToast(true);
    // Auto-hide toast after 4 seconds
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear messages when user starts typing
    if (error) setError('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await authActions.updateProfile(formData);

      // Update local user state with the complete user data from backend
      setUser(updatedUser);
      setFormData(prev => ({
        ...prev,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        description: updatedUser.description || ''
      }));

      // TODO: Add translation
      showToastMessage();
    } catch (error) {
      // TODO: Add translation
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      // TODO: Add translation
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      // TODO: Add translation
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authActions.changePassword(formData.currentPassword, formData.newPassword);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // TODO: Add translation
      showToastMessage();
    } catch (error) {
      // TODO: Add translation
      setError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolunteerToggle = async () => {
    if (!user) return;

    const newVolunteerStatus = !isVolunteer(user);
    setPendingVolunteerChange(newVolunteerStatus);

    // Always open modal for confirmation, whether becoming or leaving volunteer
    setIsVolunteerModalOpen(true);
  };

  const executeVolunteerToggle = async (becomesVolunteer: boolean, description?: string) => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await authActions.toggleVolunteer(becomesVolunteer, description);

      // Update local user state with the complete user data from backend
      setUser(updatedUser);
      setFormData(prev => ({
        ...prev,
        isVolunteer: becomesVolunteer,
        description: updatedUser.description || ''
      }));

      // TODO: Add translation
      showToastMessage();
    } catch (error) {
      // TODO: Add translation
      const message = error instanceof Error ? error.message : 'Error al actualizar el estado de voluntario';
      setError(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolunteerModalSubmit = async (description?: string) => {
    if (pendingVolunteerChange !== null) {
      await executeVolunteerToggle(pendingVolunteerChange, description);
      setIsVolunteerModalOpen(false);
      setPendingVolunteerChange(null);
    }
  };

  const handleVolunteerModalCancel = () => {
    setIsVolunteerModalOpen(false);
    setPendingVolunteerChange(null);
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
    </div>;
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Responsive background with dogs */}
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

        {/* Content overlay */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-6xl py-4 ">
          <div className="w-full text-left mt-20 max-w-6xl xl:max-w-7xl 3xl:max-w-[1600px] 3xl:mt-0">
            <GoBackButton variant="outline" hideIfNoHistory />
          </div>
          <h1 className="h1 font-caprasimo mb-4 text-4xl md:text-5xl text-[var(--color-ink)] drop-shadow-lg">Mi Perfil</h1>

          <div className="avatar-shadow mx-auto m-8">
            <div className="avatar-circle size-24 sm:size-28 md:size-36">
              <img src="/media/pfp_sample.svg" alt="Perfil" className="size-full object-contain" />
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="ui-status--error mb-4 p-3 border border-[var(--color-error)] rounded">
              {error}
            </div>
          )}

          {/* Profile Update Form */}
          <div className="flex items-center justify-center mb-6 w-full 3xl:max-w-[90%] 3xl:!text-[1rem]">
            <div className="ui-panel p-8 w-full max-w-6xl">
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[var(--color-ink)]">
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium">
                    {/* TODO: Add translation */}
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    required
                    placeholder="Nombre"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="lastName" className="block text-sm font-medium">
                    {/* TODO: Add translation */}
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    required
                    placeholder="Apellidos"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    {/* TODO: Add translation */}
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    required
                    placeholder="correo@ejemplo.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Volunteer Status - Only shown for OWNERS who can toggle their volunteer status */}
                {isOwner(user) && (
                  <div className="ui-panel-muted md:col-span-2 flex items-center justify-between p-4">
                    <div>
                      <span className="text-sm font-medium">Estado de voluntario:</span>
                      <span className={`ui-status ml-2 text-xs ${isVolunteer(user) ? 'ui-status--success' : 'ui-status--neutral'}`}>
                        {/* TODO: Add translation */}
                        {isVolunteer(user) ? 'Voluntario' : 'Propietario'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVolunteerToggle}
                      disabled={isLoading}
                      className={`ui-action px-4 py-2 ${isVolunteer(user)
                          ? 'ui-action--danger !px-2 !py-0'
                          : 'ui-action--primary'
                        }`}
                    >
                      {/* TODO: Add translation */}
                      {isLoading ? 'Procesando...' : isVolunteer(user) ? 'Dejar de ser voluntario' : 'Ser voluntario'}
                    </button>
                  </div>
                )}

                {/* Volunteer Description - Shown for all volunteers (OWNER volunteers can edit, VOLUNTEER users see read-only) */}
                {isVolunteer(user) && (
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      {/* TODO: Add translation */}
                      Descripción del voluntario
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe tu experiencia, habilidades y motivación como voluntario..."
                      className="ui-control w-full px-3 py-2 shadow-sm resize-vertical min-h-[80px]"
                      disabled={isLoading || !isOwner(user)}
                      readOnly={!isOwner(user)}
                    />
                    {!isOwner(user) && (
                      <p className="ui-text-muted text-xs mt-1">
                        {/* TODO: Add translation */}
                        Los voluntarios puros no pueden editar su descripción desde aquí.
                      </p>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ui-action ui-action--primary py-2 px-4 mx-auto shadow-md"
                  >
                    {/* TODO: Add translation */}
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="flex items-center justify-center mb-6 w-full 3xl:max-w-[70%] 3xl:!text-[1rem]">
            <div className="ui-panel p-8 w-full max-w-6xl">
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-ink)] 3xl:!text-[1.7rem]">
                {/* TODO: Add translation */}
                Cambiar contraseña
              </h3>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[var(--color-ink)]">
                <div className="md:col-span-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium 3xl:!text-[1.3rem]">
                    {/* TODO: Add translation */}
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Introduce tu contraseña actual"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="newPassword" className="block text-sm font-medium 3xl:!text-[1.3rem]">
                    {/* TODO: Add translation */}
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Introduce nueva contraseña"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium 3xl:!text-[1.3rem]">
                    {/* TODO: Add translation */}
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Confirma la nueva contraseña"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                    className="ui-action ui-action--primary py-2 px-4 mx-auto shadow-md"
                  >
                    {/* TODO: Add translation */}
                    {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Modal */}
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        isCurrentlyVolunteer={isVolunteer(user)}
        onConfirm={handleVolunteerModalSubmit}
        onCancel={handleVolunteerModalCancel}
        isLoading={isLoading}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="ui-toast--success fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {/* TODO: Add translation */}
          <span className="font-medium">Acción completada correctamente</span>
        </div>
      )}

      <Footer />
    </>
  );
}
