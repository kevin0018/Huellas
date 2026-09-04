import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import '../Styles/about.css';

const team = [
  { name: 'Kevin Hernandez', image: 'dalmata.png', role: 'developerMale' },
  { name: 'Adriana Elias', image: 'labrador.png', role: 'developerFemale' },
  { name: 'Aroa Granja', image: 'chihuahua.png', role: 'developerFemale' },
  { name: 'Fernanda Montalvan', image: 'galgo.png', role: 'developerFemale' },
] as const;

export default function AboutUs() {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <main className="public-page about-page">
        <div className="public-shell">
          <header className="about-cover">
            <div className="about-cover__words">
              <p className="public-eyebrow">{translate('aboutUs')}</p>
              <h1 className="public-title">{translate('aboutTitle')}</h1>
              <p className="about-cover__belief">{translate('aboutBelief')}</p>
            </div>
            <div className="about-cover__drawing" aria-hidden="true">
              <svg className="about-cover__orbit" viewBox="0 0 360 360" fill="none" focusable="false">
                <path d="M305 78C258 9 111 13 49 98C-7 176 28 303 133 333C245 365 341 283 337 181C335 129 321 104 294 76" />
                <path d="m289 62 5 14 15-4M44 53l-6-14M25 68l-15-3M320 306l13 8" />
              </svg>
              <img src="/media/AboutUs/allPets.png" alt="" className="public-illustration" width="324" height="290" />
            </div>
          </header>

          <section className="about-mission" aria-labelledby="mission-title">
            <div className="about-mission__heading">
              <h2 className="public-heading" id="mission-title">{translate('ourMission')}</h2>
              <img src="/media/AboutUs/SkateDog.png" alt="" className="public-illustration" width="483" height="421" loading="lazy" />
            </div>
            <p className="public-intro">{translate('ourMissionText')}</p>
          </section>
        </div>

        <section className="about-vision" aria-labelledby="vision-title">
          <div className="public-shell about-vision__inner">
            <h2 id="vision-title">{translate('ourVision')}</h2>
            <p className="about-vision__statement">{translate('aboutVisionStatement')}</p>
            <svg className="about-vision__flourish" viewBox="0 0 240 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M3 16C65 3 165 3 236 12M59 21C111 14 151 14 186 18" />
            </svg>
            <p className="about-vision__text">{translate('ourVisionText')}</p>
          </div>
        </section>

        <section className="public-shell about-team" aria-labelledby="team-title">
          <div className="about-team__intro">
            <h2 className="public-heading" id="team-title">{translate('meetTheTeam')}</h2>
            <p>{translate('meetTheTeamText')}</p>
          </div>
          <ul className="about-team__portraits">
            {team.map(member => (
              <li key={member.name}>
                <div className="about-team__portrait">
                  <img src={`/media/AboutUs/${member.image}`} alt="" className="public-illustration" width="200" height="200" loading="lazy" />
                </div>
                <h3>{member.name}</h3>
                <p>{translate(member.role)}</p>
              </li>
            ))}
          </ul>
          <p className="about-team__closing">{translate('meetTheTeamText2')}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
