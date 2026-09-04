import { Link } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import { useTranslation } from '../i18n/hooks/hook';

export default function NotFoundView() {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <main className="ui-page grid min-h-[calc(100dvh-var(--nav-height))] place-items-center px-4 text-center">
        <div>
          <p className="font-caprasimo text-7xl text-[var(--huellas-lavender-1)]">404</p>
          <h1 className="mt-3 font-caprasimo text-3xl text-[var(--color-ink)]">{translate('notFoundTitle')}</h1>
          <Link className="ui-action ui-action--primary mt-6 px-5 py-3" to="/">
            {translate('backToHome')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
