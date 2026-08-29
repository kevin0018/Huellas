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
    return (
      <main className="workspace-page grid place-items-center" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]" aria-hidden="true" />
        <span className="sr-only">Cargando perfil…</span>
      </main>
    );
  }

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header">
            <GoBackButton hideIfNoHistory />
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">Tu perfil</h1>
              <p className="workspace-header__description">
                Mantén tus datos al día y decide cómo quieres participar en la comunidad.
              </p>
            </div>
          </header>

          <div className="workspace-layout">
            <aside className="workspace-rail" aria-label="Identidad y participación">
              <div className="workspace-rail__group profile-identity">
                <div className="profile-identity__avatar">
                  <img src="/media/pfp_sample.svg" alt="Avatar del perfil" />
                </div>
                <div>
                  <p className="profile-identity__name">{user.name} {user.lastName}</p>
                  <p className="profile-identity__email">{user.email}</p>
                </div>
              </div>

              <div className="workspace-rail__group profile-role">
                <p className="workspace-rail__label">Participación</p>
                <span className={`ui-status w-fit ${isVolunteer(user) ? 'ui-status--success' : 'ui-status--neutral'}`}>
                  {isVolunteer(user) ? 'Perfil voluntario' : 'Perfil propietario'}
                </span>
                {isOwner(user) && (
                  <button
                    type="button"
                    onClick={handleVolunteerToggle}
                    disabled={isLoading}
                    className={`ui-action px-4 py-2 ${isVolunteer(user) ? 'ui-action--danger' : 'ui-action--primary'}`}
                  >
                    {isLoading ? 'Procesando…' : isVolunteer(user) ? 'Dejar el voluntariado' : 'Activar voluntariado'}
                  </button>
                )}
              </div>
            </aside>

            <div className="workspace-main">
              {error && (
                <div className="workspace-alert ui-status--error" role="alert">
                  {error}
                </div>
              )}

              <section className="workspace-section" aria-labelledby="profile-data-title">
                <header className="workspace-section__header">
                  <div>
                    <h2 id="profile-data-title" className="workspace-section__title">Datos personales</h2>
                    <p className="workspace-section__description">Esta información identifica tu cuenta en Huellas.</p>
                  </div>
                </header>

                <form onSubmit={handleUpdateProfile} className="workspace-form-grid">
                  <div className="workspace-field">
                  <label htmlFor="name" className="workspace-field__label">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder="Nombre"
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field">
                  <label htmlFor="lastName" className="workspace-field__label">Apellidos</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder="Apellidos"
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field workspace-field--full">
                  <label htmlFor="email" className="workspace-field__label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder="correo@ejemplo.com"
                    disabled={isLoading}
                  />
                  </div>

                  {isVolunteer(user) && (
                  <div className="workspace-field workspace-field--full">
                    <label htmlFor="description" className="workspace-field__label">Descripción del voluntariado</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe tu experiencia, habilidades y motivación como voluntario..."
                      className="ui-control"
                      disabled={isLoading || !isOwner(user)}
                      readOnly={!isOwner(user)}
                    />
                    {!isOwner(user) && (
                      <p className="ui-text-muted text-xs">Este perfil solo permite consultar la descripción.</p>
                    )}
                  </div>
                  )}

                  <div className="workspace-form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ui-action ui-action--primary px-5 py-3"
                  >
                    {isLoading ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  </div>
                </form>
              </section>

              <section className="workspace-section" aria-labelledby="profile-security-title">
                <header className="workspace-section__header">
                  <div>
                    <h2 id="profile-security-title" className="workspace-section__title">Seguridad</h2>
                    <p className="workspace-section__description">Cambia tu contraseña sin modificar el resto del perfil.</p>
                  </div>
                </header>

                <form onSubmit={handleChangePassword} className="workspace-form-grid">
                  <div className="workspace-field workspace-field--full">
                  <label htmlFor="currentPassword" className="workspace-field__label">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="ui-control"
                    placeholder="Introduce tu contraseña actual"
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field">
                  <label htmlFor="newPassword" className="workspace-field__label">Nueva contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="ui-control"
                    placeholder="Introduce nueva contraseña"
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field">
                  <label htmlFor="confirmPassword" className="workspace-field__label">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="ui-control"
                    placeholder="Confirma la nueva contraseña"
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-form-actions">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                    className="ui-action ui-action--primary px-5 py-3"
                  >
                    {isLoading ? 'Cambiando…' : 'Cambiar contraseña'}
                  </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Volunteer Modal */}
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        isCurrentlyVolunteer={isVolunteer(user)}
        onConfirm={handleVolunteerModalSubmit}
        onCancel={handleVolunteerModalCancel}
        isLoading={isLoading}
      />

      {showSuccessToast && (
        <div className="ui-toast--success fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in" role="status">
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Cambios guardados</span>
        </div>
      )}

      <Footer />
    </>
  );
}
