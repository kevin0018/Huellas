import { Link } from 'react-router-dom';
import Footer from '../Components/footer';
import NavBar from '../Components/NavBar';
import { useTranslation } from '../i18n/hooks/hook';

export default function ResetPasswordView() {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <main className="workspace-page grid min-h-[calc(100dvh-var(--nav-height))] place-items-center">
        <section className="workspace-main max-w-xl text-center">
          <p className="mb-3 font-[var(--font-display)] text-5xl text-[var(--color-accent)]" aria-hidden="true">•••</p>
          <h1 className="workspace-header__title">{translate('passwordRecovery')}</h1>
          <p className="workspace-header__description mx-auto">{translate('passwordRecoveryDescription')}</p>
          <Link to="/login" className="ui-action ui-action--primary mt-8 px-5 py-3 no-underline">
            {translate('backToLogin')}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
