/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · genre: playful · macrostructure: Split Studio · theme: Huellas · nav/footer: preserved */
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';

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
      <main className="public-page">
        <header className="public-shell pt-12 md:pt-20">
          <p className="public-eyebrow">{translate('aboutUs')}</p>
          <h1 className="public-title mt-4 max-w-4xl">{translate('aboutTitle')}</h1>
        </header>

        <section className="public-shell grid items-center gap-8 py-12 md:grid-cols-2 md:gap-20 md:py-16" aria-labelledby="mission-title">
          <div>
            <h2 className="public-heading" id="mission-title">{translate('ourMission')}</h2>
            <p className="public-intro mt-5">{translate('ourMissionText')}</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-paper-2)] p-6 sm:p-10">
            <img src="/media/AboutUs/SkateDog.png" alt="" className="public-illustration mx-auto w-full max-w-96" width="483" height="421" />
          </div>
        </section>

        <section className="bg-[var(--color-paper-2)] py-12 md:py-16" aria-labelledby="vision-title">
          <div className="public-shell grid items-center gap-8 md:grid-cols-2 md:gap-20">
            <div className="md:col-start-2 md:row-start-1">
              <h2 className="public-heading" id="vision-title">{translate('ourVision')}</h2>
              <p className="public-intro mt-5">{translate('ourVisionText')}</p>
            </div>
            <img src="/media/AboutUs/allPets.png" alt="" className="public-illustration mx-auto w-full max-w-72 md:col-start-1 md:row-start-1" width="324" height="290" loading="lazy" />
          </div>
        </section>

        <section className="public-shell py-12 md:py-20" aria-labelledby="team-title">
          <div className="grid gap-6 md:grid-cols-2 md:gap-20">
            <div><p className="public-eyebrow">Huellas</p><h2 className="public-heading mt-4" id="team-title">{translate('meetTheTeam')}</h2></div>
            <div className="space-y-4 text-[var(--color-ink-soft)]"><p>{translate('meetTheTeamText')}</p><p>{translate('meetTheTeamText2')}</p></div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:mt-14 lg:grid-cols-4 lg:gap-8">
            {team.map(member => (
              <li key={member.name} className="min-w-0 border-t border-[var(--color-rule-strong)] pt-5">
                <img src={`/media/AboutUs/${member.image}`} alt="" className="public-illustration mb-5 size-28 object-contain sm:size-36" width="140" height="140" loading="lazy" />
                <h3 className="text-lg">{member.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{translate(member.role)}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
