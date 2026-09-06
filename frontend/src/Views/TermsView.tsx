import { Link } from 'react-router-dom';
import Footer from '../Components/footer';
import NavBar from '../Components/NavBar';
import { useTranslation } from '../i18n/hooks/hook';

export default function TermsView() {
  const { translate } = useTranslation();

  const sections = [
    ['termsServiceTitle', 'termsServiceBody'],
    ['termsHealthTitle', 'termsHealthBody'],
    ['termsPrivacyTitle', 'termsPrivacyBody'],
    ['termsCommunityTitle', 'termsCommunityBody'],
  ] as const;

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <article className="workspace-shell max-w-[52rem]">
          <header className="workspace-header workspace-header--primary">
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">{translate('termsTitle')}</h1>
              <p className="workspace-header__description">{translate('termsIntro')}</p>
            </div>
          </header>

          <div className="pt-8">
            {sections.map(([title, body]) => (
              <section className="workspace-section" key={title}>
                <h2 className="workspace-section__title">{translate(title)}</h2>
                <p className="mt-2 max-w-[68ch] text-[var(--color-ink-soft)]">{translate(body)}</p>
              </section>
            ))}
            <p className="mt-8 text-sm font-semibold text-[var(--color-muted)]">{translate('termsUpdated')}</p>
            <Link to="/register" className="ui-action ui-action--secondary mt-6 px-5 py-3 no-underline">
              {translate('register')}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
