import { RegisterOwnerCommand } from '../modules/owner/application/commands/RegisterOwnerCommand';
import { RegisterOwnerCommandHandler } from '../modules/owner/application/commands/RegisterOwnerCommandHandler';
import { ApiOwnerRepository } from '../modules/owner/infra/ApiOwnerRepository';
import { RegisterVolunteerCommand } from '../modules/volunteer/application/commands/RegisterVolunteerCommand';
import { RegisterVolunteerCommandHandler } from '../modules/volunteer/application/commands/RegisterVolunteerCommandHandler';
import { ApiVolunteerRepository } from '../modules/volunteer/infra/ApiVolunteerRepository';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import ThemeProvider from '../Components/theme/ThemeProvider';
import LanguageProvider from '../i18n/LanguageProvider';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

type UserType = 'owner' | 'volunteer';

function RegisterForm() {
  const { translate } = useTranslation();
  const [userType, setUserType] = useState<UserType>('owner');
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
    setForm((prev) => ({ ...prev, description: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
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
        setSuccess(true);
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
        setSuccess(true);
      } else {
        setError('type of user not supported');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen background-primary px-4">
      <h1 className="h1 font-caprasimo mb-4">{translate('register')}</h1>
      <form className="w-full max-w-sm flex flex-col gap-4" onSubmit={handleSubmit}>
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
          className="input"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder={translate('lastName') || 'Apellido'}
          value={form.lastName}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder={translate('email')}
          value={form.email}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={translate('password')}
          value={form.password}
          onChange={handleChange}
          className="input"
          required
        />
        {userType === 'volunteer' && (
          <textarea
            name="description"
            placeholder={translate('description') || 'Descripción'}
            value={form.description}
            onChange={handleChange}
            className="input min-h-[80px]"
            required
          />
        )}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? translate('loading') : translate('register')}
        </button>
        {error && <div className="text-red-600 text-center text-sm">{error}</div>}
        {success && <div className="text-green-600 text-center text-sm">{translate('registerSuccess') || 'Registro exitoso'}</div>}
      </form>
    </div>
  );
};

export default function Register() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavBar />
        <RegisterForm />
        <Footer />
      </ThemeProvider>
    </LanguageProvider>
  );
}
