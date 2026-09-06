import PasswordInput, { PasswordCompanion } from '../shared/ui/PasswordInput';
import { LocalizedError, messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
import { useTranslation } from '../i18n/hooks/hook';
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
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [pendingVolunteerChange, setPendingVolunteerChange] = useState<boolean | null>(null);
  const [error, setError] = useState<LocalizedMessage | null>('');
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
      showToastMessage();
    } catch (error) {
      setError(messageFromError(error, 'updateProfileError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError({ translationKey: 'passwordMismatch' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setError({ translationKey: 'passwordTooShort' });
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
      showToastMessage();
    } catch (error) {
      setError(messageFromError(error, 'changePasswordError'));
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
      showToastMessage();
    } catch (error) {
      setError(messageFromError(error, 'volunteerStatusError'));
      throw error instanceof Error ? error : new LocalizedError('volunteerStatusError');
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
        <span className="sr-only">{translate('loadingProfile')}</span>
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
              <h1 className="workspace-header__title">{translate('yourProfile')}</h1>
              <p className="workspace-header__description">
                {translate('profileDescription')}
              </p>
            </div>
          </header>

          <div className="workspace-layout">
            <aside className="workspace-rail" aria-label={translate('profileIdentity')}>
              <div className="workspace-rail__group profile-identity">
                <div className="profile-identity__avatar">
                  <img src="/media/pfp_sample.svg" alt={translate('profileAvatar')} />
                </div>
                <div>
                  <p className="profile-identity__name">{user.name} {user.lastName}</p>
                  <p className="profile-identity__email">{user.email}</p>
                </div>
              </div>

              <div className="workspace-rail__group profile-role">
                <p className="workspace-rail__label">{translate('participation')}</p>
                <span className={`ui-status w-fit ${isVolunteer(user) ? 'ui-status--success' : 'ui-status--neutral'}`}>
                  {isVolunteer(user) ? translate('volunteerRole') : translate('ownerRole')}
                </span>
                {isOwner(user) && (
                  <button
                    type="button"
                    onClick={handleVolunteerToggle}
                    disabled={isLoading}
                    className={`ui-action px-4 py-2 ${isVolunteer(user) ? 'ui-action--danger' : 'ui-action--primary'}`}
                  >
                    {isLoading ? translate('processing') : isVolunteer(user) ? translate('leaveVolunteering') : translate('enableVolunteering')}
                  </button>
                )}
              </div>
            </aside>

            <div className="workspace-main">
              {error && (
                <div className="workspace-alert ui-status--error" role="alert">
                  {translateMessage(error, translate)}
                </div>
              )}

              <section className="workspace-section" aria-labelledby="profile-data-title">
                <header className="workspace-section__header">
                  <div>
                    <h2 id="profile-data-title" className="workspace-section__title">{translate('personalDetails')}</h2>
                    <p className="workspace-section__description">{translate('personalDetailsDescription')}</p>
                  </div>
                </header>

                <form onSubmit={handleUpdateProfile} className="workspace-form-grid">
                  <div className="workspace-field">
                  <label htmlFor="name" className="workspace-field__label">{translate('name')}</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder={translate('name')}
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field">
                  <label htmlFor="lastName" className="workspace-field__label">{translate('lastNameLabel')}</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder={translate('lastNameLabel')}
                    disabled={isLoading}
                  />
                  </div>

                  <div className="workspace-field workspace-field--full">
                  <label htmlFor="email" className="workspace-field__label">{translate('emailLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="ui-control"
                    required
                    placeholder={translate('emailExample')}
                    disabled={isLoading}
                  />
                  </div>

                  {isVolunteer(user) && (
                  <div className="workspace-field workspace-field--full">
                    <label htmlFor="description" className="workspace-field__label">{translate('volunteerDescriptionLabel')}</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={translate('volunteerDescriptionPlaceholder')}
                      className="ui-control"
                      disabled={isLoading || !isOwner(user)}
                      readOnly={!isOwner(user)}
                    />
                    {!isOwner(user) && (
                      <p className="ui-text-muted text-xs">{translate('volunteerDescriptionReadOnly')}</p>
                    )}
                  </div>
                  )}

                  <div className="workspace-form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ui-action ui-action--primary px-5 py-3"
                  >
                    {isLoading ? translate('saving') : translate('saveChanges')}
                  </button>
                  </div>
                </form>
              </section>

              <section className="workspace-section" aria-labelledby="profile-security-title">
                <header className="workspace-section__header">
                  <div>
                    <h2 id="profile-security-title" className="workspace-section__title">{translate('security')}</h2>
                    <p className="workspace-section__description">{translate('passwordChangeDescription')}</p>
                  </div>
                </header>

                <form onSubmit={handleChangePassword} className="workspace-form-grid">
                  <PasswordCompanion>
                    <div className="workspace-field workspace-field--full">
                    <label htmlFor="currentPassword" className="workspace-field__label">{translate('currentPassword')}</label>
                    <PasswordInput
                      name="currentPassword"
                      toggleLabel={translate('currentPassword')}
                      autoComplete="current-password"
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="ui-control"
                      placeholder={translate('currentPasswordPlaceholder')}
                      disabled={isLoading}
                    />
                    </div>

                    <div className="workspace-field">
                    <label htmlFor="newPassword" className="workspace-field__label">{translate('newPassword')}</label>
                    <PasswordInput
                      name="newPassword"
                      toggleLabel={translate('newPassword')}
                      autoComplete="new-password"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="ui-control"
                      placeholder={translate('newPasswordPlaceholder')}
                      disabled={isLoading}
                    />
                    </div>

                    <div className="workspace-field">
                    <label htmlFor="confirmPassword" className="workspace-field__label">{translate('confirmPasswordLabel')}</label>
                    <PasswordInput
                      name="confirmPassword"
                      toggleLabel={translate('confirmPasswordLabel')}
                      autoComplete="new-password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="ui-control"
                      placeholder={translate('confirmNewPasswordPlaceholder')}
                      disabled={isLoading}
                    />
                    </div>

                    <div className="workspace-form-actions">
                    <button
                      type="submit"
                      disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                      className="ui-action ui-action--primary px-5 py-3"
                    >
                      {isLoading ? translate('changingPassword') : translate('changePassword')}
                    </button>
                    </div>
                  </PasswordCompanion>
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
          <span className="font-medium">{translate('changesSaved')}</span>
        </div>
      )}

      <Footer />
    </>
  );
}
