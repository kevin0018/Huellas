/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · genre: playful · macrostructure: Narrative Workflow · theme: Huellas · nav/footer: preserved */
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

const careSteps = [
  ['homePetTitle', 'homePetDescription'],
  ['homeRecordTitle', 'homeRecordDescription'],
  ['homeNextTitle', 'homeNextDescription'],
] as const;

export default function HomePage() {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <main className="public-page">
        <section className="public-shell grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-20" aria-labelledby="home-title">
          <div className="min-w-0">
            <p className="public-eyebrow">{translate('homeEyebrow')}</p>
            <h1 className="public-title mt-4" id="home-title">{translate('homeTitle')}</h1>
            <p className="public-intro mt-6">{translate('homeDescription')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="public-action ui-action ui-action--primary">{translate('getStarted')}</Link>
              <Link to="/login" className="public-action ui-action ui-action--secondary">{translate('login')}</Link>
            </div>
          </div>
          <div className="public-pet-portrait" aria-hidden="true">
            <img src="/media/dogs_desktop.png" alt="" className="public-illustration h-full w-full object-cover" width="1440" height="678" fetchPriority="high" />
          </div>
        </section>

        <section className="bg-[var(--color-paper-2)] py-12 md:py-20" aria-labelledby="care-steps-title">
          <div className="public-shell grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-20">
            <div>
              <p className="public-eyebrow">{translate('homeCareEyebrow')}</p>
              <h2 className="public-heading mt-4" id="care-steps-title">{translate('homeCareTitle')}</h2>
              <p className="mt-5 max-w-md text-[var(--color-ink-soft)]">{translate('homeCareDescription')}</p>
            </div>
            <ol className="grid gap-8">
              {careSteps.map(([title, description], index) => (
                <li key={title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--color-rule)] pb-8 last:border-0 last:pb-0 sm:gap-6">
                  <span className="font-[var(--font-display)] text-3xl text-[var(--color-accent)]" aria-hidden="true">{index + 1}</span>
                  <div><h3 className="text-xl">{translate(title)}</h3><p className="mt-2 text-[var(--color-ink-soft)]">{translate(description)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="public-shell grid items-center gap-8 py-12 sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] md:gap-16 md:py-20" aria-labelledby="home-about-title">
          <img src="/media/AboutUs/SkateDog.png" alt="" className="public-illustration mx-auto w-full max-w-64" width="483" height="421" loading="lazy" />
          <div>
            <h2 className="public-heading" id="home-about-title">{translate('homeTogetherTitle')}</h2>
            <p className="public-intro mt-5">{translate('homeTogetherDescription')}</p>
            <Link to="/about" className="public-action ui-action ui-action--secondary mt-6">{translate('meetTheTeam')}</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
