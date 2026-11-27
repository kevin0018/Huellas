import PasswordInput from '../shared/ui/PasswordInput';
import AuthPetPanel from './LoginPets';
import type { TranslationKey } from '../i18n/dictionary';
import { ClientError } from '../shared/errors/ClientError';
import { registerUser } from '../features/registration/registerUser';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';
import GoBackButton from '../Components/GoBackButton';

type UserType = 'owner' | 'volunteer';


export default function Register() {
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
  const [error, setError] = useState<TranslationKey | null>(null);
  const [errorTarget, setErrorTarget] = useState<'terms' | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
    setForm((prev) => ({ ...prev, description: '' }));
    if (error) setError(null);
    setErrorTarget(null);
  };

  const handleTermsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAcceptTerms(e.target.checked);
    if (errorTarget === 'terms') {
      setError(null);
      setErrorTarget(null);
    }
  };

  const getErrorKey = (error: string): TranslationKey => {
    // Extract the main error message from API response
    const errorMessage = error.toLowerCase();

    if (errorMessage.includes('owner with this email already exists') ||
      errorMessage.includes('volunteer with this email already exists') ||
      errorMessage.includes('email already exists')) {
      return 'emailAlreadyExists';
    }

    if (errorMessage.includes('network error') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection')) {
      return 'networkError';
    }

    if (errorMessage.includes('server error') ||
      errorMessage.includes('internal server error') ||
      errorMessage.includes('http 5')) {
      return 'serverError';
    }

    if (errorMessage.includes('missing required fields') ||
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid')) {
      return 'registrationError';
    }

    // Default fallback
    return 'registrationError';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('acceptTermsError');
      setErrorTarget('terms');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorTarget(null);
    try {
      await registerUser(userType, form);
      navigate('/login?registered=true');
    } catch (err) {
      if (err instanceof ClientError) {
        setError(err.code === 'NETWORK' ? 'networkError' : 'registrationError');
      } else if (err instanceof Error) {
        setError(getErrorKey(err.message));
      } else {
        setError('registrationError');
      }
      setErrorTarget(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-page auth-pet-page">
      <div className="form-page__content relative z-10">
        <AuthPetPanel title={(
          <>
            <GoBackButton variant="outline" hideIfNoHistory className="ui-button ui-button--secondary justify-self-start" />
            <h1 className="form-page__title">{translate('register') || 'Únete'}</h1>
          </>
        )}>
          <form className="auth-pet-form" onSubmit={handleSubmit} aria-busy={loading || undefined}>
            <fieldset className="form-choice-set">
              <legend className="form-legend">{translate('owner')} / {translate('volunteer')}</legend>
              <div className="form-choice-grid">
                <label className="form-choice">
                  <input
                    type="radio"
                    name="userType"
                    value="owner"
                    checked={userType === 'owner'}
                    onChange={handleUserTypeChange}
                  />
                  <span>{translate('owner') || 'Titular'}</span>
                </label>
                <label className="form-choice">
                  <input
                    type="radio"
                    name="userType"
                    value="volunteer"
                    checked={userType === 'volunteer'}
                    onChange={handleUserTypeChange}
                  />
                  <span>{translate('volunteer') || 'Voluntario'}</span>
                </label>
              </div>
            </fieldset>

            <div className="form-stack">
              <div className="form-field">
                <label className="form-label" htmlFor="register-name">{translate('name')}</label>
                <input
                  autoComplete="given-name"
                  className="form-control"
                  id="register-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="register-last-name">{translate('lastName') || 'Apellido'}</label>
                <input
                  autoComplete="family-name"
                  className="form-control"
                  id="register-last-name"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="register-email">{translate('email')}</label>
                <input
                  autoComplete="email"
                  className="form-control"
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="register-password">{translate('password')}</label>
                <PasswordInput
                  autoComplete="new-password"
                  className="form-control"
                  id="register-password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {userType === 'volunteer' && (
                <div className="form-field">
                  <label className="form-label" htmlFor="register-description">{translate('description')}</label>
                  <textarea
                    className="form-control"
                    id="register-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-meta">
              <label className="form-check" htmlFor="acceptTerms">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={handleTermsChange}
                    aria-describedby={error && errorTarget === 'terms' ? 'register-error' : undefined}
                    aria-invalid={error && errorTarget === 'terms' ? true : undefined}
                    aria-required="true"
                  />
                <span>{translate('acceptTerms')}</span>
              </label>
                <Link to="/terms" className="form-link">
                  {translate('readTerms')}
                </Link>
            </div>

            {error && <div className="form-alert" id="register-error" role="alert">{error && translate(error)}</div>}
            <button
              type="submit"
              className="ui-button form-submit"
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading && <span className="ui-spinner" aria-hidden="true" />}
              {loading ? translate('loading') : (translate('register') || 'Registrarme')}
            </button>
          </form>
        </AuthPetPanel>
      </div>
    </main>
  );
}
