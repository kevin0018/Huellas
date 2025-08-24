import { RegisterOwnerCommand } from '../modules/owner/application/commands/RegisterOwnerCommand';
import { RegisterOwnerCommandHandler } from '../modules/owner/application/commands/RegisterOwnerCommandHandler';
import { ApiOwnerRepository } from '../modules/owner/infra/ApiOwnerRepository';
import { RegisterVolunteerCommand } from '../modules/volunteer/application/commands/RegisterVolunteerCommand';
import { RegisterVolunteerCommandHandler } from '../modules/volunteer/application/commands/RegisterVolunteerCommandHandler';
import { ApiVolunteerRepository } from '../modules/volunteer/infra/ApiVolunteerRepository';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

type UserType = 'owner' | 'volunteer';


function RegisterForm() {
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('owner');
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    description: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
    setForm((prev) => ({ ...prev, description: '' }));
  };

  const handleTermsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAcceptTerms(e.target.checked);
  };

  const getErrorMessage = (error: string): string => {
    // Extract the main error message from API response
    const errorMessage = error.toLowerCase();
    
    if (errorMessage.includes('owner with this email already exists') || 
        errorMessage.includes('volunteer with this email already exists') ||
        errorMessage.includes('email already exists')) {
      return translate('emailAlreadyExists');
    }
    
    if (errorMessage.includes('network error') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection')) {
      return translate('networkError');
    }
    
    if (errorMessage.includes('server error') || 
        errorMessage.includes('internal server error') ||
        errorMessage.includes('http 5')) {
      return translate('serverError');
    }
    
    if (errorMessage.includes('missing required fields') ||
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')) {
      return translate('registrationError');
    }
    
    // Default fallback
    return translate('registrationError');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError(translate('acceptTerms') + '.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (userType === 'owner') {
        const repo = new ApiOwnerRepository();
        const handler = new RegisterOwnerCommandHandler(repo);
        const command = new RegisterOwnerCommand(
          form.name,
          form.lastName,
          form.email,
          form.password
        );
        await handler.execute(command);
        
        navigate('/login?registered=true');
      } else if (userType === 'volunteer') {
        const repo = new ApiVolunteerRepository();
        const handler = new RegisterVolunteerCommandHandler(repo);
        const command = new RegisterVolunteerCommand(
          form.name,
          form.lastName,
          form.email,
          form.password,
          form.description
        );
        await handler.execute(command);

        navigate('/login?registered=true');
      } else {
        setError(translate('registrationError'));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(getErrorMessage(err.message));
      } else {
        setError(translate('registrationError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />
      <div className="relative z-10 w-full flex flex-col items-center max-w-lg">
        <h1 className="h1 font-caprasimo m-8 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">{translate('register') || 'Únete'}</h1>
        <form className="w-full max-w-xs sm:max-w-md md:max-w-lg p-6 sm:p-8 bg-white/90 dark:bg-[#51344D]/90 rounded-xl shadow-lg border border-[#51344D] flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 mb-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="owner"
                checked={userType === 'owner'}
                onChange={handleUserTypeChange}
                className="accent-eggplant"
              />
              <span className="ml-2">{translate('owner') || 'Titular'}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="volunteer"
                checked={userType === 'volunteer'}
                onChange={handleUserTypeChange}
                className="accent-eggplant"
              />
              <span className="ml-2">{translate('volunteer') || 'Voluntario'}</span>
            </label>
          </div>
          <input
            type="text"
            name="name"
            placeholder={translate('name')}
            value={form.name}
            onChange={handleChange}
            className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder={translate('lastName') || 'Apellido'}
            value={form.lastName}
            onChange={handleChange}
            className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
            required
          />
          <input
            type="email"
            name="email"
            placeholder={translate('email')}
            value={form.email}
            onChange={handleChange}
            className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={translate('password')}
            value={form.password}
            onChange={handleChange}
            className="input bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
            required
          />
          {userType === 'volunteer' && (
            <textarea
              name="description"
              placeholder={translate('description') || 'Descripción'}
              value={form.description}
              onChange={handleChange}
              className="input min-h-[80px] bg-[#FDF2DE] border-2 border-[#51344D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9886AD] dark:bg-[#BAA9CB] dark:text-white"
              required
            />
          )}
          {/* Terms and conditions checkbox and link */}
          <div className="flex flex-col gap-0 mt-2 mb-1">
            <label className="flex flex-col items-start gap-0">
              <span className="flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={handleTermsChange}
                  className="accent-eggplant w-4 h-4"
                  required
                />
                <span className="text-sm select-none dark:text-[#FDF2DE] 3xl:!text-[1.5rem]">{translate('acceptTerms')}</span>
              </span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs underline text-[#51344D] hover:opacity-80 dark:text-[#FDF2DE] mt-1 ml-0">
                {translate('readTerms')}
              </a>
            </label>
          </div>
          <button
            type="submit"
            className="btn font-bold py-2 rounded-md mt-2 transition-colors w-full"
            style={{ background: '#51344D', color: '#fff' }}
            disabled={loading}
          >
            {loading ? translate('loading') : (translate('register') || 'Registrarme')}
          </button>
          {error && <div className="text-red-600 text-center text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default function Register() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavBar />
        <RegisterForm />
      </ThemeProvider>
    </LanguageProvider>
  );
}
