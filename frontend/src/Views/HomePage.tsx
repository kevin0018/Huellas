import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';
import { useSessionUser } from '../features/auth/useSessionUser';
import { Capability, hasCapability } from '../modules/auth/domain/User';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import BookCoverArt from '../Components/BookCoverArt';
import CareIcon from '../shared/ui/CareIcon';
import '../Styles/home.css';

const carePages = [
  { tab: 'homePetTab', title: 'homePetTitle', description: 'homePetDescription', icon: 'paw', fields: ['petIdentity', 'microchip', 'allergies'] },
  { tab: 'homeRecordTab', title: 'homeRecordTitle', description: 'homeRecordDescription', icon: 'book', fields: ['healthEventVaccination', 'healthEventTreatment', 'healthEventWeight'] },
  { tab: 'homeNextTab', title: 'homeNextTitle', description: 'homeNextDescription', icon: 'calendar', fields: ['nextAppointment', 'upcomingCare', 'reminderPreferences'] },
] as const;

export default function HomePage() {
  const { translate } = useTranslation();
  const user = useSessionUser();
  const managesPets = hasCapability(user, Capability.MANAGE_PETS);
  const destination = managesPets ? '/user-home' : user ? '/user-profile' : '/register';
  const actionLabel = managesPets ? 'careAgenda' : user ? 'profile' : 'getStarted';
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
        <div className="public-shell">
          <section className="home-cover" aria-labelledby="home-title">
            <div className="home-cover__copy">
              <p className="home-cover__note"><CareIcon name="book"/>{translate('homeEyebrow')}</p>
              <h1 className="home-cover__title" id="home-title">{translate('homeTitle')}{' '}<em>{translate('homeTitleAccent')}</em></h1>
              <p className="home-cover__intro">{translate('homeDescription')}</p>
              <div className="home-cover__actions">
                <Link to={destination} className="public-action ui-action ui-action--primary"><CareIcon name="paw"/>{translate(actionLabel)}</Link>
                {!user && <Link to="/login" className="home-cover__login">{translate('login')}<CareIcon name="arrow"/></Link>}
              </div>
            </div>
            <BookCoverArt />
          </section>

          <section className="home-care" aria-labelledby="care-steps-title">
            <header className="home-care__header">
              <h2 className="public-heading" id="care-steps-title">{translate('homeCareTitle')}</h2>
              <div className="home-care__rule" aria-hidden="true"><CareIcon name="paw"/></div>
            </header>
            <div className="home-notebook">
              <div className="home-notebook__tabs" role="tablist" aria-labelledby="care-steps-title">
                {carePages.map(({tab, icon}, index) => (
                  <button key={tab} type="button" role="tab" id={`care-tab-${index}`} aria-controls={`care-page-${index}`} aria-selected={activePage === index} tabIndex={activePage === index ? 0 : -1}
                    ref={element => { tabs.current[index] = element; }} onClick={() => setActivePage(index)} onKeyDown={event => navigatePages(event, index)}>
                    <CareIcon name={icon}/>{translate(tab)}
                  </button>
                ))}
              </div>
              {carePages.map(({title, description, fields}, index) => (
                <div key={title} role="tabpanel" id={`care-page-${index}`} aria-labelledby={`care-tab-${index}`} hidden={activePage !== index} tabIndex={0} className="home-notebook__page">
                  <div className="home-notebook__photo"><img src="/pets/dog7.jpg" alt="" loading="lazy" width="160" height="160"/></div>
                  <div><h3>{translate(title)}</h3><p>{translate(description)}</p></div>
                  <ul>{fields.map(field => <li key={field}>{translate(field)}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
          <section className="home-together" aria-labelledby="home-about-title">
            <h2 className="public-heading" id="home-about-title">{translate('homeTogetherTitle')}</h2>
            <Link to="/about" className="home-cover__login">{translate('meetTheTeam')}<CareIcon name="arrow"/></Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
