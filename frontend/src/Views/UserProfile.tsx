import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import VolunteerModal from "../Components/VolunteerModal";
import { ApiAuthRepository } from '../modules/auth/infra/ApiAuthRepository';
import { UpdateProfileCommandHandler } from '../modules/auth/application/commands/UpdateProfileCommandHandler';
import { ChangePasswordCommandHandler } from '../modules/auth/application/commands/ChangePasswordCommandHandler';
import { ToggleVolunteerCommandHandler } from '../modules/auth/application/commands/ToggleVolunteerCommandHandler';
import { UpdateProfileCommand } from '../modules/auth/application/commands/UpdateProfileCommand';
import { ChangePasswordCommand } from '../modules/auth/application/commands/ChangePasswordCommand';
import { ToggleVolunteerCommand } from '../modules/auth/application/commands/ToggleVolunteerCommand';
import type { User } from '../modules/auth/domain/User';
import { isVolunteer } from '../modules/auth/domain/User';

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

  // Initialize command handlers with useMemo to avoid recreation on every render
  const authRepository = useMemo(() => new ApiAuthRepository(), []);
  const updateProfileHandler = useMemo(() => new UpdateProfileCommandHandler(authRepository), [authRepository]);
  const changePasswordHandler = useMemo(() => new ChangePasswordCommandHandler(authRepository), [authRepository]);
  const toggleVolunteerHandler = useMemo(() => new ToggleVolunteerCommandHandler(authRepository), [authRepository]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userSession = await authRepository.getCurrentUser();
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
  }, [navigate, authRepository]);

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
      const command = new UpdateProfileCommand(
        formData.name,
        formData.lastName,
        formData.email,
        formData.description
      );
      
      const updatedUser = await updateProfileHandler.handle(command);
      
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
      const command = new ChangePasswordCommand(
        formData.currentPassword,
        formData.newPassword
      );
      
      await changePasswordHandler.handle(command);
      
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
      const command = new ToggleVolunteerCommand(becomesVolunteer, description);
      const updatedUser = await toggleVolunteerHandler.handle(command);
      
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
      setError(error instanceof Error ? error.message : 'Error al actualizar el estado de voluntario');
    } finally {
      setIsLoading(false);
      setPendingVolunteerChange(null);
    }
  };

  const handleVolunteerModalSubmit = async (description?: string) => {
    setIsVolunteerModalOpen(false);
    if (pendingVolunteerChange !== null) {
      await executeVolunteerToggle(pendingVolunteerChange, description);
    }
  };

  const handleVolunteerModalCancel = () => {
    setIsVolunteerModalOpen(false);
    setPendingVolunteerChange(null);
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Responsive background with dogs */}
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

        {/* Content overlay */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-6xl py-4">
          <div className="w-full text-left mt-20 max-w-6xl xl:max-w-7xl 3xl:max-w-[1600px] 3xl:mt-0">
            <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
          </div>
          <h1 className="h1 font-caprasimo mb-4 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">Mi Perfil</h1>

          <img
            src="/media/pfp_sample.svg"
            alt="Perfil" // TODO: Add translation variable for alt text
            className="w-24 md:w-32 lg:w-48 rounded-full mb-8"
          />

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Profile Update Form */}
          <div className="bg-gray-100 dark:bg-[#51344D] flex items-center justify-center mb-6 3xl:max-w-[90%] 3xl:!text-[1rem]">
            <div className="bg-[#FFFAF0]/90 dark:bg-[#51344D]/90 p-8 rounded-lg shadow-lg w-full max-w-6xl">
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[#51344D] dark:text-[#FDF2DE]">
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
                    required
                    placeholder="correo@ejemplo.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Volunteer Status */}
                <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 dark:bg-[#51344D] rounded-lg border-2 border-[#BCAAA4] dark:border-[#FDF2DE]">
                  <div>
                    <span className="text-sm font-medium">Estado de voluntario:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${isVolunteer(user) ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
                      {/* TODO: Add translation */}
                      {isVolunteer(user) ? 'Voluntario' : 'Propietario'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleVolunteerToggle}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isVolunteer(user)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#BCAAA4] hover:bg-[#A89B9D] text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {/* TODO: Add translation */}
                    {isLoading ? 'Procesando...' : isVolunteer(user) ? 'Dejar de ser voluntario' : 'Ser voluntario'}
                  </button>
                </div>

                {/* Volunteer Description - Only shown for volunteers */}
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
                      className="w-full px-3 py-2 bg-white dark:bg-[#51344D] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm focus:outline-none focus:ring-[#BCAAA4] focus:border-[#BCAAA4] text-[#51344D] dark:text-[#FDF2DE] placeholder-gray-400 dark:placeholder-gray-300 resize-vertical min-h-[80px]"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-4 bg-[#BCAAA4] hover:bg-[#A89B9D] mx-auto text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* TODO: Add translation */}
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="bg-gray-100 dark:bg-[#51344D] flex items-center justify-center mb-6 3xl:max-w-[70%] 3xl:!text-[1rem]">
            <div className="bg-[#FFFAF0]/90 dark:bg-[#51344D]/90 p-8 rounded-lg shadow-lg w-full max-w-6xl">
              <h3 className="text-lg font-semibold mb-4 text-[#51344D] dark:text-[#FDF2DE] 3xl:!text-[1.7rem]">
                {/* TODO: Add translation */}
                Cambiar contraseña
              </h3>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[#51344D] dark:text-[#FDF2DE]">
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
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
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#51344D] dark:text-[#FDF2DE] border border-gray-300 dark:border-[#FDF2DE] rounded-md shadow-sm placeholder-gray-400 dark:placeholder-[#FDF2DE] focus:outline-none focus:ring-indigo-500 focus:border-[#51344D] dark:focus:border-[#FDF2DE]"
                    placeholder="Confirma la nueva contraseña"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                    className="py-2 px-4 bg-[#BCAAA4] hover:bg-[#A89B9D] mx-auto text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
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