import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import HuellasCat from '../shared/ui/HuellasCat';
import '../Styles/home.css';

const carePages = [
  ['homePetTab', 'homePetTitle', 'homePetDescription'],
  ['homeRecordTab', 'homeRecordTitle', 'homeRecordDescription'],
  ['homeNextTab', 'homeNextTitle', 'homeNextDescription'],
] as const;

function RecordDrawing() {
  return (
    <svg viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path className="home-record__sheet" d="m57 31 115-8 13 155-115 8Z" />
      <path d="m66 34 13 146M52 56l18-1M55 85l18-1M57 114l19-1M60 143l18-1" />
      <path d="m125 54 2 29m-16-13 29-2M98 107l58-4m-56 22 36-2m-34 22 52-4" />
      <path className="home-record__heart" d="M179 148c-30-25-51 12 6 38 48-39 19-70-6-38Z" />
      <path d="m188 38 9-9m-4 22 14 2M35 135l-10 8" />
    </svg>
  );
}

export default function HomePage() {
  const { translate } = useTranslation();
  const [activePage, setActivePage] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigatePages(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % carePages.length
      : event.key === 'ArrowLeft' ? (index + carePages.length - 1) % carePages.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? carePages.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActivePage(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <NavBar />
      <main className="public-page home-page">
        <section className="public-shell home-cover" aria-labelledby="home-title">
          <p className="home-cover__note">{translate('homeEyebrow')}</p>
          <h1 className="home-cover__title" id="home-title">
            {translate('homeTitle')}{' '}<span>{translate('homeTitleAccent')}</span>
          </h1>
          <p className="public-intro home-cover__intro">{translate('homeDescription')}</p>
          <div className="home-cover__actions">
            <Link to="/register" className="public-action ui-action ui-action--primary">{translate('getStarted')}<span aria-hidden="true">↗</span></Link>
            <Link to="/login" className="public-action ui-action ui-action--secondary">{translate('login')}</Link>
          </div>
          <div className="home-cover__dog" aria-hidden="true"><img src="/media/AboutUs/SkateDog.png" alt="" className="public-illustration" width="483" height="421" /></div>
          <div className="home-cover__cat"><HuellasCat /></div>
          <svg className="home-cover__thread" viewBox="0 0 1000 80" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><path d="M0 60C150 70 180 8 300 30s140 42 195 13 95-4 142 12S885 11 1000 40" /></svg>
        </section>

        <section className="home-care public-shell" aria-labelledby="care-steps-title">
          <div className="home-notebook">
            <div className="home-notebook__tabs" role="tablist" aria-label={translate('homeCareTitle')}>
              {carePages.map(([tab], index) => (
                <button key={tab} type="button" role="tab" id={`care-tab-${index}`} aria-controls={`care-page-${index}`} aria-selected={activePage === index} tabIndex={activePage === index ? 0 : -1}
                  ref={element => { tabs.current[index] = element; }} onClick={() => setActivePage(index)} onKeyDown={event => navigatePages(event, index)}>
                  {translate(tab)}
                </button>
              ))}
            </div>
            <div className="home-notebook__spread">
              <header className="home-notebook__intro">
                <p className="home-notebook__inscription">{translate('homeCareEyebrow')}</p>
                <h2 className="public-heading" id="care-steps-title">{translate('homeCareTitle')}</h2>
                <p>{translate('homeCareDescription')}</p>
                <svg viewBox="0 0 120 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M10 20c12 35 58 41 83 7M73 28l24-6-5 22" /></svg>
              </header>
              {carePages.map(([, title, description], index) => (
                <div key={title} role="tabpanel" id={`care-page-${index}`} aria-labelledby={`care-tab-${index}`} hidden={activePage !== index} tabIndex={0} className="home-notebook__page">
                  <div className="home-notebook__drawing">
                    {index === 0 ? <img src="/media/AboutUs/allPets.png" alt="" className="public-illustration" width="324" height="290" loading="lazy" />
                      : index === 1 ? <RecordDrawing />
                        : <img src="/media/AboutUs/SkateDog.png" alt="" className="public-illustration" width="483" height="421" loading="lazy" />}
                  </div>
                  <h3>{translate(title)}</h3>
                  <p>{translate(description)}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="home-care__note">{translate('homeNote')}</p>
        </section>

        <section className="public-shell home-together" aria-labelledby="home-about-title">
          <h2 className="public-heading" id="home-about-title">{translate('homeTogetherTitle')}</h2>
          <div>
            <p className="public-intro">{translate('homeTogetherDescription')}</p>
            <Link to="/about" className="home-together__link">{translate('meetTheTeam')}<span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
